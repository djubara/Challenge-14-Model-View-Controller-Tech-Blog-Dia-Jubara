const router = require('express').Router();


const { User, BlogPost, Comment } = require('../models');

// router.get('/', async (req, res) => {
//     res.render('home', {loggedIn: req.session.loggedIn});
// });

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
});

//get blogposts for homepage
router.get('/', async (req, res) => {
    try {
        const blogPostData = await BlogPost.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username'],
                },
                {
                    model: Comment,
                    attributes: ['content', 'user_id', 'blogPost_id', 'createdAt'],
                    include: {
                        model: User,
                        attributes: ['username'],
                    },
                },
            ],
        });

        const blogPosts = blogPostData.map((blogPost) => {
            console.log('Blog post content:', blogPost.content);

            const post = blogPost.get({ plain: true });
            // post.users = blogPost.User ? blogPost.User.get({ plain: true}) : null;
            // post.comment = blogPost.Comment ? blogPost.Comment.map((comment) => {
            //     const com = comment.get({ plain: true });
            //     com.user = comment.Users ? comment.Users.get({ plain: true}) : null;
            //     console.log('Plain comment:', com);
            //     return com;
            // }) : [];
            console.log('Post:', post);
            return post;
        });

        // console.log('comments:', blogPosts[0].comment[0].content);
        console.log('Blog posts with comments:', blogPosts);
        res.render('home', {
            blogPosts,
            loggedIn: req.session.loggedIn,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
let blogId;
router.post('/', async (req, res) => {
    console.log('req.body', req.body);
    try {
        const newComment = await Comment.create({
            ...req.body,

            user_id: req.session.userId
        });
        res.status(200).json(newComment);
    } catch (err) {
        console.log("error", err);
        res.status(400).json(err);
    }
});

router.get('/signup', async (req, res) => {
    res.render('signup');
});

module.exports = router;