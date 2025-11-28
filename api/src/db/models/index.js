import User from './User.js';
import File from './File.js';
import Post from './Post.js';

// Define associations
User.hasMany(File, {
    foreignKey: 'ownerId',
    as: 'files'
});

File.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});

User.hasMany(Post, {
    foreignKey: 'ownerId',
    as: 'posts'
});

Post.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});

// Many-to-many relationship between Post and File
Post.belongsToMany(File, {
    through: 'post_files',
    foreignKey: 'post_id',
    otherKey: 'file_id',
    as: 'files'
});

File.belongsToMany(Post, {
    through: 'post_files',
    foreignKey: 'file_id',
    otherKey: 'post_id',
    as: 'posts'
});

export { User, File, Post };
