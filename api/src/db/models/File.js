import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const File = sequelize.define('File', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'original_name'
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type'
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    s3Key: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 's3_key'
    },
    encryptedAesKey: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'encrypted_aes_key'
    },
    iv: {
        type: DataTypes.STRING(255),
        allowNull: false
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
    tableName: 'files',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default File;
