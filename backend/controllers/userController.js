const { User, SPBU, Role, DataTypes } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// @desc    Register user
// @route   POST /api/users/register
// @access  Private (Super Admin only)
const registerUser = async (req, res) => {
  try {
    // Only Super Admin can register users
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can register users.'
      });
    }
    
    const { name, username, email, password, role, spbu } = req.body;

    // Check if user already exists by email or username
    let userExists;
    if (email) {
      userExists = await User.findOne({ where: { email } });
    } else {
      userExists = await User.findOne({ where: { username } });
    }

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate role
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // If role is Admin or Operator, SPBU is required
    if ((role === 'Admin' || role === 'Operator') && !spbu) {
      return res.status(400).json({
        success: false,
        message: 'SPBU is required for Admin and Operator roles'
      });
    }

    // Check if SPBU exists
    if (spbu) {
      const spbuExists = await SPBU.findByPk(spbu);
      if (!spbuExists) {
        return res.status(400).json({
          success: false,
          message: 'SPBU not found'
        });
      }
    }

    // Create user
    const userData = {
      name,
      username,
      password,
      role_id: roleRecord.id,
      spbu_id: role === 'Super Admin' ? null : spbu
    };
    
    // Only add email if provided
    if (email) {
      userData.email = email;
    }

    const user = await User.create(userData);

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    // Get user with role and SPBU info
    const userWithDetails = await User.findByPk(user.id, {
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });
    
    // Transform data to ensure role and spbu are properly included
    const userDataResponse = userWithDetails.toJSON();
    // Ensure role and spbu are properly formatted for frontend
    userDataResponse.role = userDataResponse.Role ? userDataResponse.Role.name : null;
    userDataResponse.spbu = userDataResponse.SPBU ? {
      name: userDataResponse.SPBU.name,
      code: userDataResponse.SPBU.code
    } : null;
    // Remove the nested objects to avoid confusion
    delete userDataResponse.Role;
    delete userDataResponse.SPBU;

    res.status(201).json({
      success: true,
      token,
      data: userDataResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    
    const { email, username, password } = req.body;

    // Validate email/username and password
    if ((!email && !username) || !password) {
      console.log('Missing email/username or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide an email or username and password'
      });
    }

    // Check for user by email or username
    let whereClause = {};
    if (email) {
      whereClause.email = email;
    } else if (username) {
      whereClause.username = username;
    }

    console.log('Searching user with where clause:', whereClause);
    
    const user = await User.findOne({ 
      where: whereClause,
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all operators
// @route   GET /api/users/operators
// @access  Private (Super Admin: full access, Admin: read-only)
const getOperators = async (req, res) => {
  try {
    let operators;
    
    const operatorRole = await Role.findOne({ where: { name: 'Operator' } });
    if (!operatorRole) {
      return res.status(404).json({
        success: false,
        message: 'Operator role not found'
      });
    }
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all operators
      operators = await User.findAll({
        where: {
          role_id: operatorRole.id
        },
        include: [
          { model: Role, attributes: ['name'] },
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else if (req.user.Role.name === 'Admin') {
      // Admin only sees operators from their SPBU
      operators = await User.findAll({
        where: {
          role_id: operatorRole.id,
          spbu_id: req.user.spbu_id
        },
        include: [
          { model: Role, attributes: ['name'] },
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else {
      // For other roles (e.g., Operator), return empty array or specific permission error
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    // Transform data to ensure role and spbu are properly included
    const operatorsWithDetails = operators.map(operator => {
      const operatorData = operator.toJSON();
      // Ensure role and spbu are properly formatted for frontend
      operatorData.role = operatorData.Role ? operatorData.Role.name : null;
      operatorData.spbu = operatorData.SPBU ? {
        name: operatorData.SPBU.name,
        code: operatorData.SPBU.code
      } : null;
      // Remove the nested objects to avoid confusion
      delete operatorData.Role;
      delete operatorData.SPBU;
      return operatorData;
    });
    
    res.status(200).json({
      success: true,
      count: operatorsWithDetails.length,
      data: operatorsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Super Admin: full access, Admin: read-only)
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check permissions for Admin role
    if (req.user.Role.name === 'Admin' && user.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view users from your SPBU.'
      });
    }
    
    // Transform data to ensure role and spbu are properly included
    const userData = user.toJSON();
    // Ensure role and spbu are properly formatted for frontend
    userData.role = userData.Role ? userData.Role.name : null;
    userData.spbu = userData.SPBU ? {
      name: userData.SPBU.name,
      code: userData.SPBU.code
    } : null;
    // Remove the nested objects to avoid confusion
    delete userData.Role;
    delete userData.SPBU;

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Super Admin only)
const updateUser = async (req, res) => {
  try {
    // Log seluruh request untuk debugging
    console.log('Update user request params:', req.params);
    console.log('Update user request body:', req.body);
    console.log('Update user request user:', req.user);
    
    // Only Super Admin can update users
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can update users.'
      });
    }
    
    let user = await User.findByPk(req.params.id);
    
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user.toJSON());
    
    // Buat salinan body untuk dimanipulasi
    const updateData = { ...req.body };
    
    // Handle role update
    if (updateData.role) {
      console.log('Processing role update:', updateData.role);
      const roleRecord = await Role.findOne({ where: { name: updateData.role } });
      if (!roleRecord) {
        console.log('Role not found:', updateData.role);
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      updateData.role_id = roleRecord.id;
      delete updateData.role;
      console.log('Role converted to role_id:', updateData.role_id);
    }
    
    // Handle SPBU update
    if (updateData.spbu) {
      console.log('Processing SPBU update:', updateData.spbu);
      // Check if spbu is a number (ID) or string (name/code)
      let spbuRecord;
      if (typeof updateData.spbu === 'number') {
        console.log('SPBU is a number, finding by ID');
        spbuRecord = await SPBU.findByPk(updateData.spbu);
      } else {
        console.log('SPBU is a string, finding by name or code');
        // Assume it's a name or code
        spbuRecord = await SPBU.findOne({ 
          where: { 
            [DataTypes.Op.or]: [
              { name: updateData.spbu },
              { code: updateData.spbu }
            ]
          } 
        });
      }
      
      if (!spbuRecord) {
        console.log('SPBU not found:', updateData.spbu);
        return res.status(400).json({
          success: false,
          message: 'SPBU not found'
        });
      }
      
      updateData.spbu_id = spbuRecord.id;
      delete updateData.spbu;
      console.log('SPBU converted to spbu_id:', updateData.spbu_id);
    }
    
    // Handle special case for Super Admin - they should not have an SPBU
    if (updateData.role_id) {
      const roleRecord = await Role.findByPk(updateData.role_id);
      if (roleRecord && roleRecord.name === 'Super Admin') {
        console.log('User is Super Admin, setting spbu_id to null');
        updateData.spbu_id = null;
      }
    }
    
    // Hapus field yang tidak perlu diupdate
    delete updateData.id; // Jangan izinkan perubahan ID
    delete updateData.created_at; // Jangan izinkan perubahan timestamp
    delete updateData.updated_at; // Jangan izinkan perubahan timestamp

    // Log data yang akan diupdate
    console.log('Updating user with data:', updateData);

    // Update user
    user = await user.update(updateData);
    
    // Log hasil update
    console.log('User updated:', user.toJSON());

    // Get updated user with details
    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });
    
    // Transform data to ensure role and spbu are properly included
    const userData = updatedUser.toJSON();
    // Ensure role and spbu are properly formatted for frontend
    userData.role = userData.Role ? userData.Role.name : null;
    userData.spbu = userData.SPBU ? {
      name: userData.SPBU.name,
      code: userData.SPBU.code
    } : null;
    // Remove the nested objects to avoid confusion
    delete userData.Role;
    delete userData.SPBU;

    // Log data yang akan dikirim dalam response
    console.log('Response data:', userData);

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error updating user:', error); // Tambahkan logging untuk debugging
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin only)
const deleteUser = async (req, res) => {
  try {
    // Only Super Admin can delete users
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can delete users.'
      });
    }
    
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set in the protect middleware
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Super Admin: full access, Admin: read-only)
const getUsers = async (req, res) => {
  try {
    let users;
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all users
      users = await User.findAll({
        include: [
          { model: Role, attributes: ['name'] },
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else if (req.user.Role.name === 'Admin') {
      // Admin only sees users from their SPBU
      users = await User.findAll({
        where: {
          spbu_id: req.user.spbu_id
        },
        include: [
          { model: Role, attributes: ['name'] },
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else {
      // For other roles (e.g., Operator), return empty array or specific permission error
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    // Transform data to ensure role and spbu are properly included
    const usersWithDetails = users.map(user => {
      const userData = user.toJSON();
      // Ensure role and spbu are properly formatted for frontend
      userData.role = userData.Role ? userData.Role.name : null;
      userData.spbu = userData.SPBU ? {
        name: userData.SPBU.name,
        code: userData.SPBU.code
      } : null;
      // Remove the nested objects to avoid confusion
      delete userData.Role;
      delete userData.SPBU;
      return userData;
    });
    
    res.status(200).json({
      success: true,
      count: usersWithDetails.length,
      data: usersWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, dob, language } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dob !== undefined) updateData.dob = dob;
    if (language !== undefined) updateData.language = language;
    
    // Update user
    const user = await User.update(updateData, {
      where: { id: req.user.id },
      returning: true,
      plain: true
    });
    
    if (!user[1]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get updated user with details
    const updatedUser = await User.findByPk(req.user.id, {
      include: [
        { model: Role, attributes: ['name'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ],
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/me/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate request data
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Check if new password is different from current password
    const isNewMatch = await user.matchPassword(newPassword);
    
    if (isNewMatch) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Change user email
// @route   PUT /api/users/me/email
// @access  Private
const changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    
    // Validate request data
    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new email and password'
      });
    }
    
    // Validate email format
    if (!newEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Check if new email is different from current email
    if (user.email === newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email must be different from current email'
      });
    }
    
    // Check if email is already taken
    const existingUser = await User.findOne({ where: { email: newEmail } });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }
    
    // Update email
    await User.update(
      { email: newEmail },
      { where: { id: req.user.id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Email updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validate request data
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion'
      });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user
    await User.destroy({ where: { id: req.user.id } });
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getOperators,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  changeEmail,
  deleteAccount
};