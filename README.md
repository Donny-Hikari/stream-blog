# Stream Blog
This is a framework for blog.
It will load posts from json files instead of from database, which doesn't work for static site.
It might have some limitation, but useful in case we post articles from local rather than dynamically from website.

# The Loading Process
In this section, the working process of function 'loadHomepage()' will be revealed.
First of all, the loader search for list of posts of years in "./blogs/list/years.json", which should contain a json array describing where each year's list of posts is. Notice that the links should be relative to "./blogs/list/".

> This is an example.
>> ./blogs/list/years.json

```json
[
	"../2017/2017.json",
	"../2016/2016.json"
]
```
Link "../2017/2017.json" will be redirected to "./blogs/list/../2017/2017.json". Similarly link "../2016/2016.json" will be redirected to "./blogs/list/../2016/2016.json". Notice that the link could point to anywhere with any file name so long as the link is relative to "./blogs/list/".

Next, the loader search for the link described in 'years.json'. Take "../2017/2017.json" for example. The loader will search for "./blogs/list/../2017/2017.json". Once found, the loader begin to load the links in it. It's similar to the process before. A json array contianing the list of posts of the year is expected. And again, the links should be relative to "./blogs/list/../2017/".

> This is an example.
>> ./blogs/2016/2016.json

```json
[
	"./10/08/postinfo.json",
	"./10/07/postinfo.json"
]
```
Link "./10/07/postinfo.json" will be redirected to "./blogs/list/../2016/./10/07/postinfo.json", which is equal to "./blogs/2016/10/07/postinfo.json".

Finally, the loader comes to the last stage: loading the 'postinfo.json' and display it on the homepage. The data format in the 'postinfo.json' will be introduced in next section - 2. vaild info in 'postinfo.json'.

# Posts Loading
The section talks about how the function 'loadpost(folder)' works.

1.	* If there is 'postinfo.json' under the folder, blogsLoader will read the info in the file.
	* If not, the blogsLoader search for 'index.xml'.
2.	Vaild info in 'postinfo.json':
	1. type:
		* HTML: default
		* XML
	2. main:
		* Main file of the article, which blogsLoader load into blogContainer.
	3. title:
		* If "title" is not provided, blogsLoader will search for an id "blogtitle" in the article. Once found, it will be set as title.
	4. author
	5. date:
		* Date the article create.
	6. poster:
		* Poster of the article. Display on list.

# About
Author: [Donny Hikari](https://github.com/Donny-Hikari "GitHub")

# License
>Licensed under MIT license

>Copyright (c) 2017 Donny Hikari

>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:

>The above copyright notice and this permission notice shall be included in all
>copies or substantial portions of the Software.

>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
>SOFTWARE.