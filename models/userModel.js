
const UserSchema = {
  tableName: "users",
  columns: {
    id: {
      type: "BIGSERIAL",
      primaryKey: true,
    },
    username: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    email: {
      type: "VARCHAR(150)",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "TEXT",
      notNull: true,
    },
    status: {
      type: "VARCHAR(20)",
      default: "'offline'", // online/offline/away
    },
    profile_picture: {
      type: "TEXT", // store image URL or path
      notNull: false,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: "NOW()",
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
      default: "NOW()",
    },
  },
//   indexes: [
//     {
//       name: "users_email_lower_idx",
//       unique: true,
//       expression: "LOWER(email)", // ensures case-insensitive uniqueness
//     },
//   ],
};

module.exports = UserSchema;
