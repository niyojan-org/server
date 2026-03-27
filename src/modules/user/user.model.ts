import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserDocument } from "./user.types";
import { AUTH_PROVIDERS, GENDER_OPTIONS, ORGANIZATION_ROLES, USER_ROLES } from "./user.constants";

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: {
      type: String,
      minLength: 6,
      select: false,
      required: function (): boolean {
        return !this.provider || this.provider === "local";
      },
    },
    lastPasswordChangeAt: { type: Date, default: null },
    provider: { type: String, enum: AUTH_PROVIDERS, default: "local" },
    providerId: { type: String, unique: true, sparse: true, index: true },
    lastLoginProvider: { type: String, enum: AUTH_PROVIDERS },
    isVerified: { type: Boolean, default: false },
    gender: { type: String, enum: GENDER_OPTIONS },
    phone_number: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    address: { type: String, trim: true },
    bio: { type: String, trim: true },
    notificationsPreference: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    role: { type: String, enum: USER_ROLES, default: "user" },
    organization: {
      id: { type: Schema.Types.ObjectId, ref: "Organization" },
      status: { type: String, enum: ["active", "pending", "inactive"] },
      role: { type: String, enum: ORGANIZATION_ROLES },
      joinedAt: { type: Date },
      invitationToken: { type: String },
      invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.index({ "organization.id": 1 });

UserSchema.static("findByEmail", function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
});

UserSchema.pre<UserDocument>("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
    this.lastPasswordChangeAt = new Date();
  }
});

const UserModel: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
