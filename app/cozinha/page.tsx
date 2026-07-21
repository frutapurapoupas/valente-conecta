import { redirect } from 'next/navigation';

export default function CozinhaPage() {
  redirect('/cozinha/catalogo?perfil=publico');
}
