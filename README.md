# coding.space

## How to contribute to the curriculum

### Getting set up

1. Create an account at https://c9.io -- it'll ask for a credit card, but it won't charge you.

2. Create a new HTML workspace for you to work on coding.space in.

3. Create a GitHub account 

4. Fork the [coding.space repo](https://github.com/stevekrouse/coding.space) to your github account by clicking the Fork button

4. Clone your forked repo with this command in the Cloud9 terminal:

    ```
    git clone https://github.com/YourGithubUsername/coding.space.git
    ```

4. Now you can add or edit anything you want without affecting the actual website.


### Making changes and additions

1. Take a look at scratch/ , woof/ , and web/ to familiarize yourself with the directory structure. Make sure you create new files in the right place.

2. When creating a new untutorial, it's a good idea to make a copy of an existing untutorial, rename it, and use it as a template. That way, you can make sure the style and layout are uniform.

3. When you're finished making the untutorial, add a screenshot thumbnail of the project to the proper images/ subfolder ( scratch/images/ | woof/images/ | web/images/ ).

4. Add a link to your new untutorial in the proper index.html file ( scratch/index.html | woof/index.html | web/index.html ) and include the thumbnail. Use your judgment when choosing which level it belongs in.

5. When your changes are complete, create a new local branch and commit your changes to it. Give your branch a descriptive name, like "catch-the-mouse-untutorial"
    ```
    git checkout -b catch-the-mouse-untutorial
    ```    

6. Then add, commit and push the branch to your github repo. 
    ```
    git add . -p
    git commit -m "my changes"
    git push 
    ```

7. Submit a pull request to the main `stevekrouse/coding.space` repo and await approval or feedback.


If you want to get quick feedback before pushing your branch and making a pull request, you can send Steve a link to your project/changes on c9.io

#### Embedding Scratch projects

* For Scratch projects, to embed step-by-step examples, go to the project page on Scratch, and click "embed" -- you can copy/paste the iframe from there.

#### Adding Woof projects

* For Woof projects, please include the code for the full project in the `coding.space/woof/code/` directory so that it can serve as the answer key for our teachers.

* Save all images in the`coding.space/woof/images` directory and all audio in the `coding.space/woof/audio` directory. Do not hard link.

* Step-by-step examples of the project should be included in the `coding.space/woof/snippets` directory and linked to from your untutorial. 

* Please don't embed examples for Woof projects as iframes -- they tend to slow things down on woofjs.com. Just include a link instead.
