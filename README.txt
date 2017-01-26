1.	If there is "bloginfo.json" under the folder, blogsLoader will read the info in the file.
	If not, the blogsLoader search for "index.xml".
2.	Vaild info in "bloginfo.json":
	1. type:
		- HTML: default
		- XML
	2. main:
		Main file of the blog, which blogsLoader load into blogContainer.
	3. title:
		If "Title" is not provided, blogsLoader will search for an id "blogtitle" in the blog. Once found, it will be set as title.
	4. author