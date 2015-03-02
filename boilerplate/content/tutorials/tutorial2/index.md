---
layout: sidebar
priority: high
note: |  
  <p>TO DOs:</p> 
  <ul>
  <li>To Do Item 1</li>
  <li>To Do Item 2</li>
  <li>To Do Item 3</li>
  </ul>
---


<p class="alert alert-danger">Draft: This content is a work in progress.  For a list of dependencies and To Do list, click the bottom right info icon.</p>

# Tutorial 2 - Markdown Tables #

## Tables ##
You can create tables by assembling a list of words and dividing them with hyphens `- ` (for the first row), and then separating each column with a pipe `|`:

```
First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell
```

First Header  | Second Header
------------- | -------------
Content Cell  | Content Cell
Content Cell  | Content Cell

## Dashes don't have to line up ##

Note that the dashes at the top don't need to match the length of the header text exactly:

```
| Name | Description          |
| ------------- | ----------- |
| Help      | Display the help window.|
| Close     | Closes a window     |
```

| Name | Description          |
| ------------- | ----------- |
| Help      | Display the help window.|
| Close     | Closes a window     |



## Colons for alignment ##

Finally, by including colons : within the header row, you can define text to be left-aligned, right-aligned, or center-aligned:

```
| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |
```

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |


A colon on the left-most side indicates a left-aligned column; a colon on the right-most side indicates a right-aligned column; a colon on both sides indicates a center-aligned column.

## Just use html ##

You can also use HTML for table markup with html tags such as `table`, `thead`, `tbody`, `tfoot`, `tr`, `td`, `th`.


[ipsum-image-00]: http://placehold.it/800x300
[ipsum-image-01]: http://placehold.it/800x800
[ipsum-image-02]: http://placehold.it/800x200
[ipsum-image-03]: http://placehold.it/800x200

[ipsum-image-00A]: holder.js/800x300
[ipsum-image-01A]: holder.js/800x800
[ipsum-image-02A]: holder.js/800x200
[ipsum-image-03A]: holder.js/800x200/sky


