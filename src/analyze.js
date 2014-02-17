MP4.analyze = function(blob, callback) {
  if (!(blob instanceof Blob)) throw new TypeError("Invalid argument type");

  var ab = new ArrayBuffer(8);
  var dv = new DataView(ab);
  var atom = new MP4.Atoms.Atom(dv);

  atom.size = MP4.Atoms.Atom.HeaderSize + blob.size;
  atom.type = 'root';
  atom.dataSize = -8;
  atom.parsed = true;

  var reader = new FileReader();
  reader.onloadend = function(ev) {
    if (ev.target.readyState === FileReader.DONE) {
      if (ev.target.result != "ftyp") {
        var context = new MP4.Context();
        context.error = new Error("Input data format is not mp4/mov");
        callback(context.result());
        return;
      }
  
      blob.rewind();
      MP4.Atoms.visitChildren(atom, blob, new MP4.Context(), function(context) {
        callback(context.result());
      }, reader);
    }
  };

  blob.skip(4);
  reader.readAsText(blob.poll(4));

  return true;
}
