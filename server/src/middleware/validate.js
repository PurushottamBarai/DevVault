export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(400).json({ error: 'Validation failed' });
  }
};
