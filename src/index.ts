export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    const io = require('socket.io')(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('message', async (message) => {
        try {
          // Store message in database
          const storedMessage = await strapi.entityService.create('api::message.message', {
            data: {
              content: message.text,
              sender: message.userId,
              room: 'server',
              publishedAt: new Date()
            }
          });

          // Echo back the same message
          io.to(socket.id).emit('message', {
            id: storedMessage.id,
            text: message.text,
            sender: 'Server',
            userId: 'server',
            timestamp: new Date().toISOString(),
            isServerMessage: true
          });
        } catch (error) {
          console.error('Error storing message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {
    // Load existing messages when server starts
    console.log('Loading message history...');
  },
};
