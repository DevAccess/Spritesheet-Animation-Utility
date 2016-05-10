# Spritesheet-Animation-Utility
Just a prototype so far. It is not very easy to use yet and it is very buggy.

The purpose of this utility is to build a spritesheet made of uniform sized frames. This makes writing code for the spritesheet a lot easier.

This tool is meant to be used together with other software that splits up an existing spreadsheet into individual frames. I use Alferd Spritesheet Unpacker.

There are a few bugs that make using this a bit difficult. They will be fixed soon enough.

# Use

Individual frames are added by dragging and dropping into the editor. Each animation will correspond to a single row in the resulting spritesheet.

You can save your projects to open and edit them at a later time. All data is saved as a json file.

You can also export for use in a game. You'll get two downloads. One png spritesheet file, and a JSON file that defines the start locations and size of each frame. This file also contains extra information such as collision boxes which are explained below. The image data in the exported json can be ignored.

There is also an additional feature where you can add two collision boxes to each animation. you can define the size of each box for individual frames.

One is meant to be a body collision box that represents the object or characters main collision box. The other is an attack collision box which should only be added to animations that need it.

The main use involves adding images and selecting individual frames by clicking on them and moving the sprite around to get all frames positioned properly. Once it plays smoothly you move on to another animation.

The (FPS) animation speed is what will be exported for the selected animation. The zoom level is only for the editor.

There is an example project json file in the examples folder. Load up the index.html and import the file using the file input on the top left of the page.
This example spritesheet was built on a file I found online from a ripped or recreated street fighter 2 sprite of Ryu.

You will have to select the animations starting from the end and clicking the "process spacing" button for each one. This is a bug. The collision boxes are also messed up on import because of the incorrect frame sizes. This is a related bug.

# Note
This project was built for a simple game I made while I was learning iOS programming. It was an extremely rushed project. This is some of the worst JavaScript code I have ever written, but it worked.




