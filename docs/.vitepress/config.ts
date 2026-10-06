import { defineConfig } from "vitepress";

const siteUrl = "https://pwlmc.github.io";
const base = "/ok-fp/";
const socialImageUrl = `${siteUrl}${base}og-image.png`;

export default defineConfig({
	base,
	title: "OK-FP",
	description: "Essential Effect Data Types for TypeScript",
	head: [["meta", { name: "google-site-verification", content: "-O6a7un1C5o07MfCJS56xE7NzA2QeRvlvj9_BRwrHgU" }]],
	sitemap: {
		hostname: `${siteUrl}${base}`,
	},
	transformHead: ({ description, pageData, title }) => {
		const path = pageData.relativePath.replace(/index\.md$/, "").replace(/\.md$/, ".html");
		const canonicalUrl = new URL(`${base}${path}`, siteUrl).href;

		return [
			["link", { rel: "canonical", href: canonicalUrl }],
			["meta", { property: "og:type", content: "website" }],
			["meta", { property: "og:title", content: title }],
			["meta", { property: "og:description", content: description }],
			["meta", { property: "og:url", content: canonicalUrl }],
			["meta", { property: "og:image", content: socialImageUrl }],
			["meta", { property: "og:image:alt", content: "OK-FP, Essential Effect Data Types for TypeScript" }],
			["meta", { name: "twitter:card", content: "summary_large_image" }],
			["meta", { name: "twitter:title", content: title }],
			["meta", { name: "twitter:description", content: description }],
			["meta", { name: "twitter:image", content: socialImageUrl }],
		];
	},
	themeConfig: {
		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Getting Started", link: "/" },
					{ text: "Option", link: "/option" },
					{ text: "Either", link: "/either" },
					{ text: "Validation", link: "/validation" },
					{ text: "Task", link: "/task" },
					{ text: "TaskEither", link: "/task-either" },
				],
			},
		],
		socialLinks: [{ icon: "github", link: "https://github.com/pwlmc/ok-fp" }],
		outline: {
			level: [2, 3],
		},
	},
});
