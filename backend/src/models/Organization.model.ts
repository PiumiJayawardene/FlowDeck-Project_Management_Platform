import mongoose, { Document, Schema, Types } from "mongoose"

export type OrgRole = "admin" | "manager" | "member"

export interface IOrganizationMember {
  user: Types.ObjectId
  role: OrgRole
  joinedAt: Date
}

export interface IOrganization extends Document {
  name: string
  slug: string
  ownerId: Types.ObjectId
  members: IOrganizationMember[]
  createdAt: Date
  updatedAt: Date
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "manager", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [organizationMemberSchema], default: [] },
  },
  { timestamps: true }
)

const Organization = mongoose.model<IOrganization>("Organization", organizationSchema)
export default Organization