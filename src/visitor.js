/**
 * Read and visit children atoms
 * @param {MP4.Atoms.Atom} parent
 * @param {Blob} blob
 * @param {MP4.Context} context
 * @param {function(MP4.Context)} callback
 * @param {FileReader=} reader
 */
MP4.Atoms.visitChildren = function(parent, blob, context, callback, reader) {
  blob.skip(parent.headerSize+parent.dataSize);
  if (blob.eof()) {
    callback(context);
  } else {
    reader = reader || new FileReader();

    reader.onloadend = function(ev) {
      if (ev.target.readyState === FileReader.DONE) {
        if (ev.target.result.byteLength < MP4.Atoms.Atom.HeaderSize) {
          callback(context);
          return;
        }

        var data = new DataView(ev.target.result);

        var atom = new MP4.Atoms.Atom(data, 0);
        if (atom.size < atom.headerSize) {
          callback(context);
          return;
        }

        if (atom.type in MP4.Atoms.Map && MP4.Atoms.Map[atom.type].visitor) {
          context.parent = parent.type;
          MP4.Atoms.Map[atom.type].visitor(atom, blob.read(atom.size), context, function(r) {
            if (!blob.eof())
              reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
            else
              callback(context);
          });
        } else {
          blob.skip(atom.size);
          if (!blob.eof())
            reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
          else
            callback(context);
        }
      }
    };

    reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
  }
}

/**
 * Default atom visitor
 * @param {MP4.Atoms.Atom} atom
 * @param {Blob} blob
 * @param {MP4.Context} context
 * @param {function(MP4.Context)} callback
 */
MP4.Atoms.visitor = function(atom, blob, context, callback) {
  if (atom.type in MP4.Atoms.Map) {
    if (!atom.parsed) {
      if (MP4.Atoms.Map[atom.type].parser) {
        var reader = new FileReader();

        reader.onloadend = function(ev) {
          if (ev.target.readyState === FileReader.DONE) {
            var data = new DataView(ev.target.result);
            atom = MP4.Atoms.Map[atom.type].parser(context, data, 0);
            MP4.Atoms.visitChildren(atom, blob, context, callback, reader);
          }
        };

        reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Map[atom.type].parsedSize));
      } else {
        atom.dataSize = MP4.Atoms.Map[atom.type].parsedSize-atom.headerSize;
        MP4.Atoms.visitChildren(atom, blob, context, callback);
      }
    } else {
      MP4.Atoms.visitChildren(atom, blob, context, callback);
    }
  } else {
    callback(context);
  }
};
