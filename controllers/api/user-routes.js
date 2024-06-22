const router = require('express').Router();

const { User, BlogPost } = require('../../models');



// CREATE new user
router.post('/signup', async (req, res) => {
    try {
        const userData = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        req.session.save(() => {
            req.session.loggedIn = true;
            res.status(200).json(userData);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

//Login
router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (!userData) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }
        const validPassword = await userData.checkPassword(req.body.password);

        if (!validPassword) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        req.session.save(() => {
            req.session.loggedIn = true;
            req.session.userId = userData.id;
            res
                .status(200)
                .json({ user: userData, message: 'You are now logged in!' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


// Authenticate user and render dashboard
// This route is protected and will only render the dashboard if the user is authenticated
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.session.loggedIn) {
        // Retrieve the current user's ID from the session
        const userId = req.session.userId; // Assuming user ID is stored in the session

        if (userId) {
            // Query the database to fetch blog posts created by the current user
            BlogPost.findAll({ where: { user_id: userId } }) // Use 'user_id' to match the foreign key in the BlogPost model
                .then(blogPostData => {
                    // Serialize data
                    const blogPosts = blogPostData.map(blogPost => blogPost.get({ plain: true }));
                    // Pass serialized data and session flag into the template
                    res.render('dashboard', { blogPosts, loggedIn: req.session.loggedIn });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error fetching user posts');
                });
        } else {
            res.status(400).send('User ID not found in session');
        }
    } else {
        res.redirect('/login'); // Redirect to login page if session is not authenticated
    }
});
//Middleware function to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    }
    res.redirect('/login');
}

//get one post
router.get('/:id', async (req, res) => {
    try {
        const blogPostData = await BlogPost.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['username'] }],
        });

        if (!blogPostData) {
            res.status(404).json({ message: 'No post found with this id!' });
            return;
        }

        const blogPost = blogPostData.get({ plain: true });
        res.render('single-post', { blogPost, loggedIn: req.session.loggedIn });
    } catch (err) {
        res.status(500).json(err);
    }
});
//create post
router.post('/', async (req, res) => {
    try {
        const newPost = await BlogPost.create({
            ...req.body,
            user_id: req.session.userId
        });
        console.log("req.body", req.body);

        res.status(200).json(newPost);
        console.log("Post created successfully", newPost);
    } catch (err) {
        res.status(400).json(err);
    }
});

//comment on post
router.post('/comment', async (req, res) => {
    try {
        const newComment = await Comment.create({
            ...req.body,
            user_id: req.session.userId
        });

        res.status(200).json(newComment);
    } catch (err) {
        res.status(400).json(err);
    }
});
//update post
// router.put('/:id', async (req, res))

//Logout
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});
module.exports = router;