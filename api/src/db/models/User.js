import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_email_verified'
    },
    emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'email_verification_token'
    },
    emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_verification_expires'
    },
    passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password_reset_token'
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'password_reset_expires'
    },
    rsaPublicKey: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rsa_public_key'
    },
    rsaPrivateKeyEncrypted: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rsa_private_key_encrypted'
    }
}, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Hash password before creating user
User.beforeCreate(async (user) => {
    if (user.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});

// Hash password before updating if it was changed
User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateEmailVerificationToken = function () {
    this.emailVerificationToken = uuidv4();
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return this.emailVerificationToken;
};

User.prototype.generatePasswordResetToken = function () {
    this.passwordResetToken = uuidv4();
    this.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    return this.passwordResetToken;
};

User.prototype.verifyEmail = function () {
    this.isEmailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpires = null;
};

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.passwordResetToken;
    delete values.emailVerificationToken;
    delete values.rsaPrivateKeyEncrypted;
    return values;
};

// Class methods
User.findByEmail = async function (email) {
    return await this.findOne({ where: { email } });
};

User.findByVerificationToken = async function (token) {
    return await this.findOne({
        where: {
            emailVerificationToken: token,
            emailVerificationExpires: {
                [sequelize.Sequelize.Op.gt]: new Date()
            }
        }
    });
};

User.findByResetToken = async function (token) {
    return await this.findOne({
        where: {
            passwordResetToken: token,
            passwordResetExpires: {
                [sequelize.Sequelize.Op.gt]: new Date()
            }
        }
    });
};

export default User;
