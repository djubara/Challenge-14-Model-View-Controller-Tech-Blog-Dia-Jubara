
const router = require('express').Router();


const { User, BlogPost } = require('../models');

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
            ],
        });

        const blogPosts = blogPostData.map((blogPost) => {
            const post = blogPost.get({ plain: true });
            post.users = blogPost.User ? blogPost.User.get({ plain: true}) : null;
            return post;
        });

        res.render('home', {
            blogPosts,
            loggedIn: req.session.loggedIn,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/signup', async (req, res) => {
    res.render('signup');
});

module.exports = router;