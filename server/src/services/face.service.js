// Face recognition runs primarily on the CLIENT via face-api.js.
// This service handles storing / retrieving ENCRYPTED face descriptors in MongoDB.

const FaceProfile = require("../models/FaceProfile");
const { encrypt, decrypt } = require("../utils/encrypt");

// Save an encrypted descriptor array for a family member
async function saveFaceDescriptor({ userId, familyMemberId, label, descriptor, sampleImageUrl }) {
  const descriptorEncrypted = encrypt(JSON.stringify(Array.from(descriptor)));

  const profile = await FaceProfile.findOneAndUpdate(
    { userId, familyMemberId },
    { label, descriptorEncrypted, sampleImageUrl },
    { upsert: true, new: true }
  );

  return profile;
}

// Load all face profiles for a user (client will decrypt + rebuild descriptors)
async function getFaceProfiles(userId) {
  const profiles = await FaceProfile.find({ userId });

  return profiles.map((p) => ({
    _id:             p._id,
    familyMemberId:  p.familyMemberId,
    label:           p.label,
    // Decrypt descriptor to send to client for matching
    descriptor:      JSON.parse(decrypt(p.descriptorEncrypted)),
    sampleImageUrl:  p.sampleImageUrl,
  }));
}

async function deleteFaceProfile(profileId, userId) {
  return await FaceProfile.findOneAndDelete({ _id: profileId, userId });
}

module.exports = { saveFaceDescriptor, getFaceProfiles, deleteFaceProfile };

