import Settings from '../models/Settings.js'

// GET /api/settings — public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) settings = await Settings.create({})
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/settings — admin only
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) settings = await Settings.create({})
    const {
      businessName, whatsapp, email, phone, address,
      coverageArea, standardFee, sameDayFee, expressFee, scheduledFee
    } = req.body
    settings.businessName  = businessName  || settings.businessName
    settings.whatsapp      = whatsapp      || settings.whatsapp
    settings.email         = email         ?? settings.email
    settings.phone         = phone         ?? settings.phone
    settings.address       = address       ?? settings.address
    settings.coverageArea  = coverageArea  ?? settings.coverageArea
    settings.standardFee   = standardFee   ?? settings.standardFee
    settings.sameDayFee    = sameDayFee    ?? settings.sameDayFee
    settings.expressFee    = expressFee    ?? settings.expressFee
    settings.scheduledFee  = scheduledFee  ?? settings.scheduledFee
    await settings.save()
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}