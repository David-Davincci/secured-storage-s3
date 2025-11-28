import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fromEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'from_email'
    },
    toEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'to_email'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'owner_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'posts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Post;
