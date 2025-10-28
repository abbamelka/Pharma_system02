// scripts/syncExistingUsers.js
require("dotenv").config();
const { sequelize, User, Role, UserRoles } = require("../models");

async function syncExistingUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const users = await User.findAll();
    console.log(`📋 Found ${users.length} users to sync`);
    
    for (const user of users) {
      if (user.role) {
        console.log(`👤 Processing: ${user.username} (ID: ${user.id}) - Role: ${user.role}`);
        
        const role = await Role.findOne({ where: { name: user.role } });
        
        if (role) {
          const existing = await UserRoles.findOne({
            where: { userId: user.id, roleId: role.id }
          });
          
          if (existing) {
            console.log(`   ✅ Already exists in UserRoles`);
          } else {
            await UserRoles.create({
              userId: user.id,
              roleId: role.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            console.log(`   ✅ Created UserRoles entry`);
          }
        } else {
          console.log(`   ❌ Role "${user.role}" not found`);
        }
      }
    }
    
    console.log('\n🎉 Sync completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

syncExistingUsers();