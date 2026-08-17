const Service = require('../models/Service');
const User = require('../models/User');

async function getMyServices(req, res) {
  const services = await Service.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ services });
}

async function createService(req, res) {
  const { name, duration, price, description, isActive } = req.body;

  if (!name || duration === undefined || price === undefined) {
    return res.status(400).json({ message: 'name, duration and price are required' });
  }

  const service = await Service.create({
    owner: req.user._id,
    name,
    duration,
    price,
    description,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ service });
}

async function updateService(req, res) {
  const service = await Service.findOne({ _id: req.params.id, owner: req.user._id });

  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  const { name, duration, price, description, isActive } = req.body;
  if (name !== undefined) service.name = name;
  if (duration !== undefined) service.duration = duration;
  if (price !== undefined) service.price = price;
  if (description !== undefined) service.description = description;
  if (isActive !== undefined) service.isActive = isActive;

  await service.save();
  res.json({ service });
}

async function deleteService(req, res) {
  const service = await Service.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json({ message: 'Service deleted' });
}

async function getPublicServices(req, res) {
  const owner = await User.findOne({ businessSlug: req.params.businessSlug });

  if (!owner) {
    return res.status(404).json({ message: 'Business not found' });
  }

  const services = await Service.find({ owner: owner._id, isActive: true }).sort({ name: 1 });

  res.json({
    business: {
      businessName: owner.businessName,
      businessSlug: owner.businessSlug,
    },
    services,
  });
}

module.exports = { getMyServices, createService, updateService, deleteService, getPublicServices };
