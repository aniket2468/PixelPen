import { connectToDatabase } from '@/utils/mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === 'POST') {
    const { title, desc, img, slug, catSlug } = req.body;
    const newPost = {
      title,
      desc,
      img,
      slug,
      catSlug,
      createdAt: new Date(),
    };

    const result = await db.collection('posts').insertOne(newPost);
    res.status(200).json(result.ops[0]);
  } else if (req.method === 'GET') {
    const { page = 1, cat = '' } = req.query;
    const PAGE_SIZE = 3;
    const skip = (page - 1) * PAGE_SIZE;

    const query = cat ? { catSlug: cat } : {};

    const posts = await db
      .collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray();

    const count = await db.collection('posts').countDocuments(query);

    res.status(200).json({ posts, count });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
