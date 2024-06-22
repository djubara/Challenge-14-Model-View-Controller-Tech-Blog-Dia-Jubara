const User = require('./User');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');


User.hasMany(BlogPost, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

BlogPost.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = { User, BlogPost, Comment};