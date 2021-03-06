function _vv (name, svg) {

    let id = 
        name => /#/.test(name) ? vv.parse(name).id : name;

    let app 
        = _vv.get(id(name)) 
        || _vv.set(id(name), _vv.new(name));

    app._name = name;
   
    app.vnodes = app.vnodes || [];

    app.mount = 
        (dest, ...vnodes) => {

            if (typeof dest !== 'string') {
                vnodes = [dest].concat(vnodes); dest = null;
            }

            let connect = 
                ([n, attrs]) => __.forKeys(
                    (values, arrow) => app.connect(arrow, n, values)
                )(attrs || {});

            let plant = 
                ([n, attrs]) => _vv(n).plant(dest || app._name + '__' + n);

            let push = 
                ([n, _]) => app.vnodes.push(_vv(n));

            vnodes.forEach(__.do(connect, plant, push));
            return app;
        }

    app.gmount = 
        (dest, ...vnodes) => app
            .mount(dest, ...vnodes.map(([n, _]) => ['g#' + n, _]));

    app.connect = 
        (arrow, b, xs) => {
            let sig = 
                _vv.sig(..._vv.arrow(`${app._name} ${arrow} ${b}`));
            _vv.connect(sig, xs);
            return app;
        }
    
    app.stepwise = 
        j => {
            let starts = (a,b) => b.start('=> ' + a._name),
                kills = (a,b) => b.kill('=> ' + a._name),
                get = (i) => app.vnodes[i];
            app.vnodes.forEach(
                (a,i) => { 
                    if (get(i+j)) starts(a, get(i+j));
                    if (get(i-1)) kills(a, get(i-1));
                }
            );
            return app;
        };

    return app;
}

_vv.nodes = {};

_vv.new = 
    n => vv(/#/.test(n) ? n : '#' + n)
        .up('=> ' + n)
        .up('-> ' + n, false)
        .kill('!> ' + n);

_vv.get = 
    id => _vv.nodes[id];

_vv.set = 
    (id, vnode) => {
        _vv.nodes[id] = vnode;
        return vnode;
    }

_vv.sig = 
    (a, b, r) => `${a._name} ${r ? '=' : '-'}> ${b._name}`;

_vv.connect = 
    (sig, xs) => {

            let [a, b, r] = _vv.arrow(sig);
            a
                .signal(xs, sig);
            b
                .update(sig, d=>d, r);
            return _vv;
        };

_vv.link = 
    __.forKeys(
        (xs, sig) => _vv.connect(sig, vv._(xs))
    )

vv._ = 
    xs => typeof xs === 'string'
        ? xs.split(/,?\s/)
        : xs;

_vv.arrow = 
    (sig) => {

        let re = /(\w*)\s(<?[-=]>?)\s(\w*)/;
        let [s, a, link, b] = sig.match(re);
        return link[1] === '>'
            ? [_vv(a), _vv(b), link[0] === '=']
            : [_vv(b), _vv(a), link[1] === '='];
    };
