/*** __ ***/

let __ = {};


__.null = 
    () => {};

__.id =
    x => x;

__.return = 
    x => y => x;

__.X = 
    f => 
        X => f(...X);

__.$ = 
    (...xs) => 
        f => f(...xs);

__.if = 
    (f,g,h) => 
        (...xs) => f(...xs) ? g(...xs) : h(...xs);

__.pipe = 
    (f=__.id, ...fs) => fs.length
        ? (...xs) =>  __.pipe(...fs)(f(...xs))
        : (...xs) => f(...xs);

__.do = 
    (f=__.id, ...fs) => fs.length
        ? __.pipe(__.do(f), __.do(...fs))
        : x => {f(x); return x} 

__.not = 
    b => !b;

__.log = 
    x => {console.log(x); return x};

__.logs = 
    str => 
        x => {__.log(str || 'logs:'); return  __.log(x)};

__.forKeys = 
    (...fs) => 
        obj => Object.keys(obj).forEach(
            k => __.pipe(...fs)(obj[k], k)
        );

__.mapKeys = 
    (...fs) => 
        obj => {
            let obj2 = {};
            Object.keys(obj).forEach(
                k => obj2[k] = __.pipe(...fs)(obj[k], k)
            )
            return obj2;
        };

__.subKeys = 
    (...ks) => 
        obj => {
            let sub = {};
            ks.filter(k => (obj[k] !== undefined))
                .forEach(k => sub[k] = obj[k]);
            return sub;
        };

__.emptyKeys =
    obj => {
        let out = true;
        __.forKeys(k => out = false)(obj);
        return out;
    };

__.getKeys =
    obj => (...Rs) => {
        let get = v => 
            typeof v === 'function'
                ? __.X(v)
                : __.return(v);

        let promise = ([v,k]) =>
            Promise.resolve(Rs)
                .then(get(v))
                .then(u => [u,k]);

        return Promise
            .all(__.toPairs(obj).map(promise))
            .then(__.toKeys);
    };

__.genKeys = 
    (obj, ...objs) => 
        obj 
            ? (R, M={}) => __.getKeys(obj)(R, M)
                .then(N => Object.assign(M,N))
                .then(N => __.genKeys(...objs)(R, N))
            : (R, M) => Promise.resolve(M);


__.updateKeys = 
    (obj, ...objs) => obj
        ? obj0 => __.getKeys(obj)(obj0)
            .then(obj1 => Object.assign(obj0, obj1))
            .then(__.updateKeys(...objs))
        : obj0 => Promise.resolve(obj0 || {});

__.toKeys = 
    pairs => {
        let out = {};
        pairs.forEach(
            ([v, k]) => out[k] = v
        )
        return out;
    };

__.toPairs = 
    obj => {
        let out = [];
        __.forKeys(
            (v,k) => out.push([v,k])
        )(obj);
        return out;
    };

/* misc */

__.getset = getset;

__.sleep = 
    ms => new Promise(then => setTimeout(then, ms));

__.range =
    n => {
        let out = [];
        for (var i=0; i<n; i++) {
            out.push(i);
        }
        return out;
    }

/* getset */

function getset (obj, attrs) {
    let method = 
        key => function (x) {
            if (!arguments.length)
                return attrs[key];
            attrs[key] = x;
            return obj;
        };
    forEachKey(attrs)(
        key => obj[key] = method(key)
    );
    return obj;
}
