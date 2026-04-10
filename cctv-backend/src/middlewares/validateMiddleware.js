const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err.name === 'ZodError' || err.errors) {
      const issues = err.issues || err.errors;
      const errorMessages = issues.map((e) => {
        const fieldName = e.path.length > 0 ? e.path[e.path.length - 1] : 'unknown';
        return `${fieldName}: ${e.message}`;
      }).join(', ');
      
      return res.status(400).json({ 
        success: false, 
        message: `BAD_REQUEST: ข้อมูลไม่ถูกต้อง - ${errorMessages}` 
      });
    }
    next(err);
  }
};

module.exports = validate;
