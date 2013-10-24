MP4.analyze = function(file, callback) {
  if (!(file instanceof File)) throw new TypeError("Invalid argument type");
  if (file.type != "video/mp4" && file.type != "video/quicktime") {
    throw new TypeError("Input file format is not mp4/mov");
  }

  var ab = new ArrayBuffer(8);
  var dv = new DataView(ab);
  var atom = new MP4.Atoms.Atom(dv);

  atom.size = MP4.Atoms.Atom.HeaderSize + file.size;
  atom.type = 'root';
  atom.dataSize = -8;
  atom.parsed = true;

  MP4.Atoms.visitChildren(atom, file, new MP4.Context(), function(context) {
    callback(context.result());
  });
}
