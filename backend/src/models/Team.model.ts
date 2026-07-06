import mongoose, { Document, Schema, Types } from "mongoose"

export interface ITeam extends Document {
  name: string
  description: string
  organizationId: Types.ObjectId
  members: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    members: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
  },
  { timestamps: true }
)

const Team = mongoose.model<ITeam>("Team", teamSchema)
export default Team