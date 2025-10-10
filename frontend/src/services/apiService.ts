const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const get = async (url: string, options = {}) => {
  const response = await fetch(url, { ...options, method: 'GET' });
  return handleResponse(response);
};

const post = async (url: string, data: any, options = {}) => {
  const response = await fetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const put = async (url: string, data: any, options = {}) => {
  const response = await fetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const patch = async (url: string, data: any, options = {}) => {
  const response = await fetch(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const _delete = async (url: string, options = {}) => {
  const response = await fetch(url, { ...options, method: 'DELETE' });
  if (response.status === 204) {
    return;
  }
  return handleResponse(response);
};

export const apiService = {
  get,
  post,
  put,
  patch,
  delete: _delete,
};