1.	If there is "postinfo.json" under the folder, blogsLoader will read the info in the file.
	If not, the blogsLoader search for "index.xml".
2.	Vaild info in "postinfo.json":
	1. type:
		- HTML: default
		- XML
	2. main:
		Main file of the article, which blogsLoader load into blogContainer.
	3. title:
		If "Title" is not provided, blogsLoader will search for an id "blogtitle" in the article. Once found, it will be set as title.
	4. author
	5. date:
		Date the article create.
	6. poster:
		Poster of the article. Display on list.