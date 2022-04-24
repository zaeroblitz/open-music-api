exports.up = pgm => {
    pgm.addColumns('albums', {
        coverUrl: {
            type: 'TEXT',
        },
    })
};

exports.down = pgm => {
    pgm.dropColumn('albums', 'coverUrl');
};
