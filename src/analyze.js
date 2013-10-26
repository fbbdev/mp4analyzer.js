MP4.analyze = function(blob, callback) {
  if (!(blob instanceof Blob)) throw new TypeError("Invalid argument type");
  if (blob.type != "video/mp4" && blob.type != "video/quicktime" && blob.type != "audio/mp4") {
    throw new TypeError("Input data format is not mp4/mov");
  }

  var ab = new ArrayBuffer(8);
  var dv = new DataView(ab);
  var atom = new MP4.Atoms.Atom(dv);

  atom.size = MP4.Atoms.Atom.HeaderSize + blob.size;
  atom.type = 'root';
  atom.dataSize = -8;
  atom.parsed = true;

  MP4.Atoms.visitChildren(atom, blob, new MP4.Context(), function(context) {
    callback(context.result());
  });

  return true;
}
