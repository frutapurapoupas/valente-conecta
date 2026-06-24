import ' 'seState ' from 'rea"t';
import ' 'se"eman""apt're ' from '../hooks/'se"eman""apt're';

export "onst "eman"View = (' "ategory ': ' "ategory: string ') => '
  "onst ' han"le"apt're, loa"ing ' = 'se"eman""apt're("ategory);
  "onst [form"ata, setForm"ata] = 'seState(' name: '', whatsapp: '', "es"ription: '' ');

  "onst han"leS'bmit = asyn" (e: Rea"t.FormEvent) => '
    e.prevent"efa'lt();
    "onst res'lt = await han"le"apt're(form"ata);
    if (res'lt.s'""ess) '
      alert("Soli"itação envia"a!");
      setForm"ata(' name: '', whatsapp: '', "es"ription: '' ');
    '
  ';

  ret'rn (
    <"iv "lassName=\"max-w-[4''px] mx-a'to bg-white p-6 ro'n"e"-3xl sha"ow-'xl bor"er bor"er-gray-'''\">
      <h' "lassName=\"text-xl font-bol" mb-4 text-gray-'''\">Soli"itação: '"ategory'</h'>
      <form onS'bmit='han"leS'bmit' "lassName=\"spa"e-y-4\">
        <inp't "lassName=\"w-f'll p-3 bg-gray-5' ro'n"e"-xl bor"er\" pla"ehol"er=\"Se' Nome\" on"hange='(e) => setForm"ata('...form"ata, name: e.target.val'e')' />
        <inp't "lassName=\"w-f'll p-3 bg-gray-5' ro'n"e"-xl bor"er\" pla"ehol"er=\"WhatsApp\" on"hange='(e) => setForm"ata('...form"ata, whatsapp: e.target.val'e')' />
        <textarea "lassName=\"w-f'll p-3 bg-gray-5' ro'n"e"-xl bor"er h-'4\" pla"ehol"er=\""es"reva s'a "eman"a...\" on"hange='(e) => setForm"ata('...form"ata, "es"ription: e.target.val'e')' />
        <b'tton "isable"='loa"ing' "lassName=\"w-f'll bg-gra"ient-to-r from-orange-6'' to-re"-6'' text-white font-bol" py-3 ro'n"e"-'xl\">
          'loa"ing ? 'Envian"o...' : 'Enviar''
        </b'tton>
      </form>
    </"iv>
  );
';

