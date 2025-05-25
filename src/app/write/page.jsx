"use client"

import styles from "./writePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBold, 
  faItalic, 
  faStrikethrough, 
  faCode, 
  faListUl, 
  faListOl, 
  faTasks, 
  faQuoteRight, 
  faMinus, 
  faImage, 
  faSuperscript,
  faSubscript,
  faUnderline,
  faLink,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faUndo,
  faRedo,
  faPlus,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/utils/firebase";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';

// Create a lowlight instance with common languages
const lowlight = createLowlight(common);

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [uploading, setUploading] = useState(false);
  const [addButtonUploading, setAddButtonUploading] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const menuBarRef = useRef(null);

  // Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const linkModalRef = useRef(null);

  // Store event handlers in refs to ensure proper cleanup
  const dropdownHandlerRef = useRef(null);
  const linkModalHandlerRef = useRef(null);

  // Handle click outside dropdown with better cleanup
  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (dropdownRef.current && dropdownRef.current.parentNode && !dropdownRef.current.contains(event.target)) {
          setShowHeadingDropdown(false);
        }
      } catch (e) {
        // Silently handle if DOM elements are already removed
        setShowHeadingDropdown(false);
      }
    };
    
    // Store the current handler reference
    dropdownHandlerRef.current = handleClickOutside;

    if (showHeadingDropdown && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      // Use the stored reference for cleanup
      if (typeof document !== 'undefined' && dropdownHandlerRef.current) {
        try {
          document.removeEventListener('mousedown', dropdownHandlerRef.current);
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, [showHeadingDropdown]);

  // Handle click outside link modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (linkModalRef.current && linkModalRef.current.parentNode && !linkModalRef.current.contains(event.target)) {
          setShowLinkModal(false);
          try {
            resetLinkModal();
          } catch (error) {
            // Silently handle reset errors
          }
        }
      } catch (e) {
        // Silently handle if DOM elements are already removed
        setShowLinkModal(false);
      }
    };
    
    // Store the current handler reference
    linkModalHandlerRef.current = handleClickOutside;

    if (showLinkModal && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      // Use the stored reference for cleanup
      if (typeof document !== 'undefined' && linkModalHandlerRef.current) {
        try {
          document.removeEventListener('mousedown', linkModalHandlerRef.current);
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, [showLinkModal]);

  // Handle click outside category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (categoryDropdownRef.current && categoryDropdownRef.current.parentNode && !categoryDropdownRef.current.contains(event.target)) {
          setShowCategoryDropdown(false);
        }
      } catch (e) {
        // Silently handle if DOM elements are already removed
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (typeof document !== 'undefined') {
        try {
          document.removeEventListener('mousedown', handleClickOutside);
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    };
  }, [showCategoryDropdown]);

  // Sticky menuBar detection and enhancement
  useEffect(() => {
    const menuBar = menuBarRef.current;
    if (!menuBar) return;

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isSticky = entry.boundingClientRect.top <= 0 && entry.intersectionRatio < 1;
        if (isSticky) {
          menuBar.setAttribute('data-sticky', 'true');
        } else {
          menuBar.removeAttribute('data-sticky');
        }
      },
      {
        threshold: [0, 1],
        rootMargin: '-1px 0px 0px 0px'
      }
    );

    observer.observe(menuBar);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Comprehensive cleanup on unmount
  useEffect(() => {
    // Capture current ref values at effect setup time to avoid stale closure warnings
    const imageInput = imageInputRef.current;
    const addButtonImageInput = addButtonImageInputRef.current;
    const uploadInput = uploadInputRef.current;
    
    return () => {
      try {
        // Clean up input values safely using captured refs
        if (imageInput && imageInput.parentNode) {
          try {
            imageInput.value = '';
          } catch (e) {
            // Ignore if input is already removed
          }
        }
        if (addButtonImageInput && addButtonImageInput.parentNode) {
          try {
            addButtonImageInput.value = '';
          } catch (e) {
            // Ignore if input is already removed
          }
        }
        if (uploadInput && uploadInput.parentNode) {
          try {
            uploadInput.value = '';
          } catch (e) {
            // Ignore if input is already removed
          }
        }
        
        // Clean up any remaining event listeners with additional safety
        if (typeof document !== 'undefined') {
          if (dropdownHandlerRef.current) {
            try {
              document.removeEventListener('mousedown', dropdownHandlerRef.current);
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          if (linkModalHandlerRef.current) {
            try {
              document.removeEventListener('mousedown', linkModalHandlerRef.current);
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        }
      } catch (error) {
        // Silently handle any cleanup errors
        console.warn('Component cleanup warning:', error);
      }
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      HorizontalRule,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-list-item',
        },
      }),
      Superscript,
      Subscript,
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Editor cleanup - must come after useEditor
  useEffect(() => {
    return () => {
      try {
        if (editor && !editor.isDestroyed) {
          // Check if editor DOM element exists and is still in the document
          const editorElement = editor.view?.dom;
          const isElementInDocument = editorElement && document.contains && document.contains(editorElement);
          
          if (isElementInDocument) {
            // First, blur the editor to prevent pending operations
            try {
              if (editor.isFocused) {
                editor.commands.blur();
              }
              // Clear content to prevent any pending DOM operations
              editor.commands.clearContent();
            } catch (commandError) {
              // Editor commands failed, but continue with cleanup
              console.warn('Editor commands failed during cleanup:', commandError);
            }
          }
          
          // Destroy the editor with additional safety
          setTimeout(() => {
            try {
              if (editor && !editor.isDestroyed) {
                editor.destroy();
              }
            } catch (destroyError) {
              // Silently handle destroy errors
              console.warn('Editor destroy error (delayed):', destroyError);
            }
          }, 0);
        }
      } catch (error) {
        // Silently handle editor cleanup errors
        console.warn('Editor cleanup error:', error);
      }
    };
  }, [editor]);

  // Auto-focus the editor when it's ready
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          editor.commands.focus();
        } catch (error) {
          console.warn('Auto-focus failed:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editor]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploading(true);
  };

  useEffect(() => {
    const storage = getStorage(app);
    const upload = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setMedia(downloadURL);
            setUploading(false);
          });
        }
      );
    };

    file && upload();
  }, [file]);

  const imageInputRef = useRef();
  const addButtonImageInputRef = useRef();
  const uploadInputRef = useRef();

  // Category data with colors
  const categories = [
    { value: "style", label: "Style", color: "#57c4ff31" },
    { value: "fashion", label: "Fashion", color: "#da85c731" },
    { value: "food", label: "Food", color: "#7fb88133" },
    { value: "travel", label: "Travel", color: "#ff795736" },
    { value: "culture", label: "Culture", color: "#ffb04f45" },
    { value: "coding", label: "Coding", color: "#5e4fff31" }
  ];

  // Helper function to get selected category data
  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.value === selectedCategory) || { label: "Select Category", color: "transparent" };
  };

  // Link modal helper functions
  const resetLinkModal = () => {
    setLinkUrl('');
    setLinkText('');
    setIsEditingLink(false);
  };

  const openLinkModal = (selectedText = '', currentUrl = '', isEditing = false) => {
    setLinkText(selectedText);
    setLinkUrl(currentUrl);
    setIsEditingLink(isEditing);
    setShowLinkModal(true);
  };

  const handleLinkSubmit = () => {
    if (!editor || editor.isDestroyed) return;

    // Validate URL format
    let validUrl = linkUrl.trim();
    if (!validUrl) {
      // Empty URL means remove link if editing
      if (isEditingLink) {
        editor.chain().focus().unsetLink().run();
      }
      setShowLinkModal(false);
      resetLinkModal();
      return;
    }

    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://') && !validUrl.startsWith('mailto:') && !validUrl.startsWith('tel:')) {
      validUrl = 'https://' + validUrl;
    }

    if (linkText.trim()) {
      // Apply link to selected text or insert new text with link
      if (isEditingLink) {
        editor.chain().focus().setLink({ href: validUrl }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${validUrl}" class="link" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`).run();
      }
    } else {
      // No text provided, just apply link to current selection or insert URL as text
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      if (selectedText) {
        editor.chain().focus().setLink({ href: validUrl }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${validUrl}" class="link" target="_blank" rel="noopener noreferrer">${validUrl}</a>`).run();
      }
    }

    setShowLinkModal(false);
    resetLinkModal();
  };

  // Function to compress and resize image
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      console.log('Starting compression for file:', file.name, file.type, file.size);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Store object URL for cleanup
      let objectUrl = null;
      
      const cleanup = () => {
        try {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
          // Clean up canvas by clearing its dimensions (canvas created via createElement is not in DOM)
          if (canvas) {
            try {
              canvas.width = 0;
              canvas.height = 0;
              // Clear context
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            } catch (canvasCleanupError) {
              // Canvas cleanup failed, but this is not critical for functionality
              console.warn('Canvas cleanup warning (non-critical):', canvasCleanupError);
            }
          }
        } catch (cleanupError) {
          // Silently handle cleanup errors
          console.warn('Image compression cleanup warning:', cleanupError);
        }
      };
      
      img.onload = () => {
        try {
          console.log('Image loaded successfully:', img.width, 'x', img.height);
          
          // Calculate new dimensions to fit within maxWidth while maintaining aspect ratio
          let { width, height } = img;
          
          // Only resize if image is larger than maxWidth
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }
          
          console.log('Target dimensions:', width, 'x', height);
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw with better quality settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          console.log('Image drawn to canvas, converting to blob...');
          
          // Convert to blob with compression
          canvas.toBlob((blob) => {
            cleanup();
            
            if (blob) {
              console.log('Compression successful, blob size:', blob.size);
              resolve(blob);
            } else {
              console.error('Failed to create blob from canvas');
              reject(new Error('Failed to create compressed image blob'));
            }
          }, 'image/jpeg', quality);
          
        } catch (error) {
          console.error('Error during image processing:', error);
          cleanup();
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        cleanup();
        reject(new Error('Failed to load image for compression'));
      };
      
      try {
        objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      } catch (error) {
        console.error('Error creating object URL:', error);
        cleanup();
        reject(error);
      }
    });
  };

  const addImage = () => {
    if (!editor || editor.isDestroyed) return;
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleAddButtonClick = () => {
    if (!editor || editor.isDestroyed) return;
    if (addButtonImageInputRef.current) {
      addButtonImageInputRef.current.click();
    }
  };

  const handleImageInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      let fileToUpload = file;
      
      // Try to compress the image, but fallback to original file if compression fails
      try {
        console.log('Attempting to compress image...');
        fileToUpload = await compressImage(file);
        console.log('Compression successful, uploading compressed image...');
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original file:', compressionError);
        fileToUpload = file;
      }
      
      const storage = getStorage(app);
      const name = new Date().getTime() + '_image.' + (fileToUpload === file ? file.name.split('.').pop() : 'jpg');
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
      
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload error:", error);
          alert('Failed to upload image. Please try again.');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().setImage({ 
                src: downloadURL,
                alt: file.name,
                title: file.name,
                style: 'max-width: 100%; height: auto; display: block; margin: 1em auto;'
              }).run();
            }
          });
        }
      );
    } catch (error) {
      console.error("Image processing error:", error);
      alert('Error processing image: ' + error.message);
    }
  };

  const handleAddButtonImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setAddButtonUploading(true);
    
    try {
      let fileToUpload = file;
      
      // Try to compress the image, but fallback to original file if compression fails
      try {
        console.log('Attempting to compress image...');
        fileToUpload = await compressImage(file);
        console.log('Compression successful, uploading compressed image...');
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original file:', compressionError);
        fileToUpload = file;
      }
      
      const storage = getStorage(app);
      const name = new Date().getTime() + '_image.' + (fileToUpload === file ? file.name.split('.').pop() : 'jpg');
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload error:", error);
          alert('Failed to upload image. Please try again.');
          setAddButtonUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if (editor && !editor.isDestroyed) {
              editor.chain().focus().setImage({ 
                src: downloadURL,
                alt: file.name,
                title: file.name,
                style: 'max-width: 100%; height: auto; display: block; margin: 1em auto;'
              }).run();
            }
            setAddButtonUploading(false);
          });
        }
      );
    } catch (error) {
      console.error("Image processing error:", error);
      alert('Error processing image: ' + error.message);
      setAddButtonUploading(false);
    }
  };

  const addLink = () => {
    if (!editor || editor.isDestroyed) return;
    
    // Check if text is selected
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // If the selection is already a link, offer to edit it
    if (editor.isActive('link')) {
      const currentUrl = editor.getAttributes('link').href || '';
      openLinkModal(selectedText, currentUrl, true);
    } else {
      // Open modal for new link
      openLinkModal(selectedText, '', false);
    }
  };

  const getActiveHeading = () => {
    if (!editor || editor.isDestroyed) return 'Normal';
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    return 'Normal';
  };

  const setHeading = (level) => {
    if (!editor || editor.isDestroyed) return;
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
    setShowHeadingDropdown(false);
  };

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
  }

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    // Validate that title is provided
    if (!title || title.trim() === '') {
      alert('Please enter a title for your article before publishing.');
      return;
    }

    // Validate that editor exists and is not destroyed
    if (!editor || editor.isDestroyed) {
      alert('Editor is not ready. Please try again.');
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
      method: "POST",
      body: JSON.stringify({
        title,
        desc: editor.getHTML(),
        img: media,
        slug: slugify(title),
        catSlug: catSlug || "style",
      }),
    });

    if (res.status === 200) {
      const data = await res.json();
      router.push(`/posts/${data.slug}`);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.titleInput}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className={styles.uploadContainer}>
        <div className={styles.categoryDropdownContainer} ref={categoryDropdownRef}>
          <button
            className={`${styles.categoryDropdownButton} ${showCategoryDropdown ? styles.open : ''}`}
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            type="button"
          >
            <div className={styles.categoryButtonContent}>
              <div 
                className={styles.categoryColorIndicator}
                style={{ backgroundColor: getSelectedCategoryData().color }}
              ></div>
              <span>{getSelectedCategoryData().label}</span>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className={styles.categoryDropdownIcon} />
          </button>
          {showCategoryDropdown && (
            <div className={styles.categoryDropdownMenu}>
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`${styles.categoryDropdownItem} ${selectedCategory === category.value ? styles.selected : ''}`}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setCatSlug(category.value);
                    setShowCategoryDropdown(false);
                  }}
                  type="button"
                >
                  <div 
                    className={styles.categoryColorIndicator}
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input type="file" ref={uploadInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        <button onClick={() => uploadInputRef.current?.click()} className={styles.uploadButton}>
          <FontAwesomeIcon icon={faImage} /> Upload Image
        </button>
      </div>
      {uploading && <span>Uploading...</span>}
      {media && <p>Uploaded ✔️</p>}
      {addButtonUploading && <span>Uploading image...</span>}

      <div className={styles.editorContainer}>
        <div className={styles.menuBar} ref={menuBarRef}>
          {/* Undo/Redo */}
          <button
            onClick={() => editor && editor.chain().focus().undo().run()}
            disabled={!editor || !editor.can().undo()}
            className={styles.toolbarButton}
            title="Undo"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().redo().run()}
            disabled={!editor || !editor.can().redo()}
            className={styles.toolbarButton}
            title="Redo"
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>

          <div className={styles.separator}></div>

          {/* Heading Dropdown */}
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
              className={`${styles.toolbarButton} ${styles.dropdownButton}`}
              title="Heading"
            >
              <span className={styles.headingText}>H</span>
              <FontAwesomeIcon icon={faChevronDown} className={styles.dropdownIcon} />
            </button>
            {showHeadingDropdown && (
              <div className={styles.dropdown}>
                <button onClick={() => setHeading(0)} className={editor && !editor.isActive('heading') ? styles.isActive : ''}>
                  Normal
                </button>
                <button onClick={() => setHeading(1)} className={editor && editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}>
                  Heading 1
                </button>
                <button onClick={() => setHeading(2)} className={editor && editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}>
                  Heading 2
                </button>
                <button onClick={() => setHeading(3)} className={editor && editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}>
                  Heading 3
                </button>
                <button onClick={() => setHeading(4)} className={editor && editor.isActive('heading', { level: 4 }) ? styles.isActive : ''}>
                  Heading 4
                </button>
                <button onClick={() => setHeading(5)} className={editor && editor.isActive('heading', { level: 5 }) ? styles.isActive : ''}>
                  Heading 5
                </button>
                <button onClick={() => setHeading(6)} className={editor && editor.isActive('heading', { level: 6 }) ? styles.isActive : ''}>
                  Heading 6
                </button>
              </div>
            )}
          </div>

          <div className={styles.separator}></div>

          {/* Lists */}
          <button
            onClick={() => editor && editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('bulletList') ? styles.isActive : ''}`}
            title="Bullet List"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('orderedList') ? styles.isActive : ''}`}
            title="Numbered List"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faListOl} />
          </button>

          <div className={styles.separator}></div>

          {/* Blockquote */}
          <button
            onClick={() => editor && editor.chain().focus().toggleBlockquote().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('blockquote') ? styles.isActive : ''}`}
            title="Blockquote"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faQuoteRight} />
          </button>

          <div className={styles.separator}></div>

          {/* Text Formatting */}
          <button
            onClick={() => editor && editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('bold') ? styles.isActive : ''}`}
            title="Bold"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('italic') ? styles.isActive : ''}`}
            title="Italic"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleStrike().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('strike') ? styles.isActive : ''}`}
            title="Strikethrough"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faStrikethrough} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleCodeBlock().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('codeBlock') ? styles.isActive : ''}`}
            title="Code Block"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faCode} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('underline') ? styles.isActive : ''}`}
            title="Underline"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>

          <div className={styles.separator}></div>

          {/* Link */}
          <button
            onClick={() => editor && addLink()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('link') ? styles.isActive : ''}`}
            title="Add Link"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faLink} />
          </button>

          <div className={styles.separator}></div>

          {/* Superscript/Subscript */}
          <button
            onClick={() => editor && editor.chain().focus().toggleSuperscript().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('superscript') ? styles.isActive : ''}`}
            title="Superscript"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faSuperscript} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().toggleSubscript().run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive('subscript') ? styles.isActive : ''}`}
            title="Subscript"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faSubscript} />
          </button>

          <div className={styles.separator}></div>

          {/* Text Alignment */}
          <button
            onClick={() => editor && editor.chain().focus().setTextAlign('left').run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''}`}
            title="Align Left"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().setTextAlign('center').run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''}`}
            title="Align Center"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().setTextAlign('right').run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''}`}
            title="Align Right"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
          <button
            onClick={() => editor && editor.chain().focus().setTextAlign('justify').run()}
            className={`${styles.toolbarButton} ${editor && editor.isActive({ textAlign: 'justify' }) ? styles.isActive : ''}`}
            title="Justify"
            disabled={!editor}
          >
            <FontAwesomeIcon icon={faAlignJustify} />
          </button>

          <div className={styles.separator}></div>

          {/* Add Button */}
          <button
            onClick={handleAddButtonClick}
            className={styles.toolbarButton}
            title="Add Image"
            disabled={!editor || addButtonUploading}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className={styles.addText}>{addButtonUploading ? 'Uploading...' : 'Add'}</span>
          </button>
        </div>
        {editor && (
          <div 
            className={styles.editor}
            onClick={() => {
              if (editor && !editor.isDestroyed) {
                editor.commands.focus();
              }
            }}
          >
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      <button className={styles.publish} onClick={handleSubmit}>Publish</button>

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={handleImageInputChange}
      />

      <input
        type="file"
        accept="image/*"
        ref={addButtonImageInputRef}
        style={{ display: "none" }}
        onChange={handleAddButtonImageChange}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} ref={linkModalRef}>
            <div className={styles.modalHeader}>
              <h3>{isEditingLink ? 'Edit Link' : 'Add Link'}</h3>
              <button 
                className={styles.modalClose}
                onClick={() => {
                  setShowLinkModal(false);
                  resetLinkModal();
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label htmlFor="linkText">Display Text (optional)</label>
                <input
                  id="linkText"
                  type="text"
                  placeholder="Enter display text or leave empty for URL"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="linkUrl">URL*</label>
                <input
                  id="linkUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className={styles.modalInput}
                  required
                />
              </div>
              {isEditingLink && (
                <div className={styles.linkActions}>
                  <button
                    type="button"
                    onClick={() => {
                      if (editor) {
                        editor.chain().focus().unsetLink().run();
                      }
                      setShowLinkModal(false);
                      resetLinkModal();
                    }}
                    className={styles.removeLinkButton}
                  >
                    Remove Link
                  </button>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  resetLinkModal();
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkSubmit}
                className={styles.submitButton}
                disabled={!linkUrl.trim()}
              >
                {isEditingLink ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritePage;