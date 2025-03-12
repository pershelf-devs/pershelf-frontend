import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

const colors = {
  "success" : "#17c653",
  "warning" : "#f6b100",
  "primary" : "#1b84ff",
  "failure": "#f8285a",
  "danger" : "#f8285a",
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, title, message) => {
    const id = Date.now();
    
    setNotifications(prev => [...prev, { id, type, title, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 8000);
  };

  if (notifications?.length > 5) {
    notifications.shift()
  }
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-5 right-4 space-y-2 z-[100]" >
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`border border-gray-300 max-w-96 shadow-lg rounded-lg p-4 cursor-arrow bg-${notification.type.toLowerCase()} `}
            style={{backgroundColor: colors[notification.type.toLowerCase() || '#111']}}
          >
            <div className='flex justify-between items-center'>
              <div className='flex flex-row gap-2 items-center'>
                <i className="ki-filled ki-information-2 text-white text-2xl" />
                <h5 className="text-white font-semibold">{notification.title}</h5>
              </div>
              <button
                className='text-white hover:text-gray-700'
                onClick={() => removeNotification(notification.id)}
              >
                &times;
              </button>
            </div>
            <p className='text-white pr-4'>{notification.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
