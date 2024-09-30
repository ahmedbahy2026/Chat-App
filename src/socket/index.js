export const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get('io').in(roomId).emit(event, payload);
};
