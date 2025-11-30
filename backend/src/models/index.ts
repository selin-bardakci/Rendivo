import User from './User';
import Business from './Business';
import StaffMember from './StaffMember';

// Define associations
User.hasOne(Business, {
  foreignKey: 'ownerId',
  as: 'ownedBusiness',
});

Business.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

User.hasMany(StaffMember, {
  foreignKey: 'userId',
  as: 'staffMemberships',
});

StaffMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Business.hasMany(StaffMember, {
  foreignKey: 'businessId',
  as: 'staff',
});

StaffMember.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
});

export { User, Business, StaffMember };
