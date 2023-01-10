const errorMsg = {
  unknown: 'unknown',
  body_parser_invalid_syntax: 'body_parser:invalid_body',
  validation: 'validation:invalid_query',
  validation_details: {
    not_alpha: 'validation:not_alpha',
    bad_length: 'validation:bad_length',
    not_string: 'validation:not_string',
  },
  user: {
    not_unique: 'user:not_unique',
    admin_already_initied: 'user:admin_already_initied',
    not_found: 'user:not_found',
  },
  auth: {
    bad_password: 'auth:bad_password',
    not_found: 'auth:not_found',
  },
};



export default errorMsg;
