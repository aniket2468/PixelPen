import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Node } from '@tiptap/core';
import styles from '../writePage.module.css';

// Create a custom node for iframes
export const IframeNode = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: '100%'
      },
      height: {
        default: '400'
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', {
      ...HTMLAttributes,
      frameborder: '0',
      allowfullscreen: 'true',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    }];
  }
});

const urlRegex = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g;
const imageUrlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?$/i;
const videoUrlRegex = /https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|dailymotion\.com\/video\/)([^\s&]+)/i;

// Function to create and show the inline prompt
const showInlinePrompt = (view, { from, to }, message, onConfirm, url) => {
  // Remove any existing prompts
  const existingPrompt = document.querySelector(`.${styles.urlPrompt}`);
  if (existingPrompt) {
    existingPrompt.remove();
  }

  // Create prompt element
  const prompt = document.createElement('div');
  prompt.className = styles.urlPrompt;

  // Add message
  const text = document.createElement('p');
  text.className = styles.urlPromptText;
  text.textContent = message;
  prompt.appendChild(text);

  // Add buttons container
  const buttons = document.createElement('div');
  buttons.className = styles.urlPromptButtons;

  // Add confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.className = `${styles.urlPromptButton} ${styles.urlPromptConfirm}`;
  confirmBtn.textContent = 'Yes';
  confirmBtn.onclick = () => {
    onConfirm();
    prompt.remove();
  };
  buttons.appendChild(confirmBtn);

  // Add cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.className = `${styles.urlPromptButton} ${styles.urlPromptCancel}`;
  cancelBtn.textContent = 'No';
  cancelBtn.onclick = () => {
    // Insert the original URL as text and a space in two separate steps
    const tr = view.state.tr;
    if (to > from) {
      tr.delete(from, to);
    }
    tr.insertText(url)
      .insertText(' ');
    view.dispatch(tr);
    prompt.remove();
  };
  buttons.appendChild(cancelBtn);

  prompt.appendChild(buttons);

  // Position the prompt
  const coords = view.coordsAtPos(from);
  prompt.style.top = `${coords.bottom}px`;
  prompt.style.left = `${coords.left}px`;

  // Add to document
  document.body.appendChild(prompt);

  // Auto-remove after 5 seconds if no action taken
  setTimeout(() => {
    if (document.body.contains(prompt)) {
      prompt.remove();
      // Insert the original URL as text and a space in two separate steps
      const tr = view.state.tr;
      if (to > from) {
        tr.delete(from, to);
      }
      tr.insertText(url)
        .insertText(' ');
      view.dispatch(tr);
    }
  }, 5000);
};

export const UrlDetector = Extension.create({
  name: 'urlDetector',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('urlDetector'),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;

            const urls = text.match(urlRegex);
            if (!urls) return false;

            const url = urls[0];
            const { from, to } = view.state.selection;
            
            if (imageUrlRegex.test(url)) {
              event.preventDefault();
              showInlinePrompt(
                view,
                { from, to },
                'This appears to be an image URL. Would you like to embed it as an image?',
                () => {
                  view.dispatch(view.state.tr
                    .replaceSelectionWith(view.state.schema.nodes.image.create({
                      src: url,
                      alt: 'Embedded image',
                      title: 'Embedded image'
                    }))
                  );
                },
                url
              );
              return true;
            }
            
            const videoMatch = url.match(videoUrlRegex);
            if (videoMatch) {
              event.preventDefault();
              showInlinePrompt(
                view,
                { from, to },
                'This appears to be a video URL. Would you like to embed it?',
                () => {
                  let embedUrl;
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = url.includes('youtube.com') ? 
                      url.split('v=')[1].split('&')[0] : 
                      url.split('youtu.be/')[1];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&enablejsapi=1&rel=0&modestbranding=1&autoplay=0`;
                  } else if (url.includes('vimeo.com')) {
                    const videoId = url.split('vimeo.com/')[1];
                    embedUrl = `https://player.vimeo.com/video/${videoId}`;
                  } else if (url.includes('dailymotion.com')) {
                    const videoId = url.split('video/')[1];
                    embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                  }

                  if (embedUrl) {
                    view.dispatch(view.state.tr
                      .replaceSelectionWith(view.state.schema.nodes.iframe.create({
                        src: embedUrl
                      }))
                    );
                  }
                },
                url
              );
              return true;
            }

            return false;
          },

          handleTextInput: (view, from, to, text) => {
            if (!/[\s\n]$/.test(text)) return false;

            const doc = view.state.doc;
            const textContent = doc.textBetween(Math.max(0, from - 500), to + text.length, ' ');
            
            const urls = textContent.match(urlRegex);
            if (!urls) return false;

            const url = urls[urls.length - 1];
            const urlStart = from - url.length;
            
            if (imageUrlRegex.test(url)) {
              showInlinePrompt(
                view,
                { from: urlStart, to: to + text.length },
                'This appears to be an image URL. Would you like to embed it as an image?',
                () => {
                  view.dispatch(view.state.tr
                    .delete(urlStart, to + text.length)
                    .insert(urlStart, view.state.schema.nodes.image.create({
                      src: url,
                      alt: 'Embedded image',
                      title: 'Embedded image'
                    }))
                  );
                },
                url
              );
              return true;
            }
            
            const videoMatch = url.match(videoUrlRegex);
            if (videoMatch) {
              showInlinePrompt(
                view,
                { from: urlStart, to: to + text.length },
                'This appears to be a video URL. Would you like to embed it?',
                () => {
                  let embedUrl;
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = url.includes('youtube.com') ? 
                      url.split('v=')[1].split('&')[0] : 
                      url.split('youtu.be/')[1];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&enablejsapi=1&rel=0&modestbranding=1&autoplay=0`;
                  } else if (url.includes('vimeo.com')) {
                    const videoId = url.split('vimeo.com/')[1];
                    embedUrl = `https://player.vimeo.com/video/${videoId}`;
                  } else if (url.includes('dailymotion.com')) {
                    const videoId = url.split('video/')[1];
                    embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                  }

                  if (embedUrl) {
                    view.dispatch(view.state.tr
                      .delete(urlStart, to + text.length)
                      .insert(urlStart, view.state.schema.nodes.iframe.create({
                        src: embedUrl
                      }))
                    );
                  }
                },
                url
              );
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
}); 