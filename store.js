const PREFIX='hanmadi.';
function read(key,fallback){try{const value=localStorage.getItem(PREFIX+key);return value==null?fallback:JSON.parse(value);}catch{return fallback;}}
function writeOrThrow(key,value){localStorage.setItem(PREFIX+key,JSON.stringify(value));}
function write(key,value){try{writeOrThrow(key,value);return true;}catch{return false;}}
function list(key){const value=read(key,[]);return Array.isArray(value)?value:[];}
export const store={
  read,write,writeOrThrow,list,
  favorites:()=>list('favorites'),
  isFavorite:id=>list('favorites').includes(id),
  toggleFavorite(id){const previous=list('favorites'),on=!previous.includes(id);writeOrThrow('favorites',on?[id,...previous]:previous.filter(x=>x!==id));return on;},
  settings:()=>({animations:true,theme:'system',workplace:'public',...read('settings',{})}),
  saveSettings:s=>write('settings',s),
};
