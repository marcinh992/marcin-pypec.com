import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function sortPostsByDate(posts: BlogPost[]) {
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getReadingMinutes(post: BlogPost) {
	const body = 'body' in post && typeof post.body === 'string' ? post.body : post.data.description;
	const words = body.trim().split(/\s+/).filter(Boolean).length;

	return Math.max(4, Math.round(words / 220));
}

export function getPrimaryTag(post: BlogPost) {
	return post.data.tags.at(0) ?? 'Engineering';
}

export function getUniqueTags(posts: BlogPost[]) {
	return Array.from(new Set(posts.flatMap((post) => post.data.tags))).sort((a, b) => a.localeCompare(b));
}
