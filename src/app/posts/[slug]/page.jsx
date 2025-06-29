import Menu from "@/components/menu/Menu";
import styles from "./singlePage.module.css";
import Image from "next/image";
import Comments from "@/components/comments/Comments";
import { formatDistanceToNow, parseISO } from "date-fns";
import { notFound } from "next/navigation";
import prisma from "@/utils/connect";
import { recordView, getViewCount } from "@/lib/cache";

const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

// Generate static params for top 1000 posts (pre-generate at build time)
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      select: { slug: true },
      take: 1000, // Pre-generate top 1000 posts
      orderBy: { views: 'desc' }
    });
    
    return posts.map(post => ({
      slug: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { 
        title: true, 
        desc: true, 
        img: true,
        user: { select: { name: true } }
      }
    });
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.'
      };
    }

    const description = post.desc ? 
      post.desc.replace(/<[^>]*>/g, '').substring(0, 160) : 
      'Read this article on PixelPen';

    return {
      title: `${post.title} | PixelPen`,
      description,
      authors: [{ name: post.user?.name || 'PixelPen Author' }],
      openGraph: {
        title: post.title,
        description,
        images: post.img ? [
          {
            url: post.img,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: post.img ? [post.img] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'PixelPen',
      description: 'Express yourself in Pixels'
    };
  }
}

// Server-side rendered component (runs at build time for static generation)
const SinglePage = async ({ params }) => {
  const { slug } = params;

  try {
    // Get post data at build time
    const data = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!data) {
      notFound();
    }

    // Record view for analytics (non-blocking)
    recordView(slug).catch(err => console.error('View recording failed:', err));
    
    // Get additional views from Redis
    const additionalViews = await getViewCount(slug);
    const totalViews = data.views + additionalViews;

    const formattedDate = formatDistanceToNow(parseISO(data.createdAt), { addSuffix: true });
    const readTime = calculateReadTime(data.desc);

    return (
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>{data.title}</h1>
            <div className={styles.user}>
              {data.user?.image && (
                <div className={styles.userImageContainer}>
                  <Image src={data.user.image} alt="" fill className={styles.avatar} />
                </div>
              )}
              <div className={styles.userTextContainer}>
                <span className={styles.username}>{data.user.name}</span>
                <span className={styles.date}>
                  {formattedDate} • {readTime} min read • {totalViews} views
                </span>
              </div>
            </div>
          </div>
          {data.img && (
            <div className={styles.imageContainer}>
              <Image src={data.img} alt={data.title} fill className={styles.image} />
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.post}>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: data.desc }} />
            <div className={styles.comment}>
              <Comments postSlug={slug} />
            </div>
          </div>

          <div className={styles.sidebar}>
            <Menu 
              articleContent={data.desc} 
              articleTitle={data.title}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
};

export default SinglePage;