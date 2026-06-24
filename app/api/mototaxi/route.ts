import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'mototaxi.json');

type DriverPlan = 'gratis' | 'basico' | 'premium';
type RideStatus = 'solicitada' | 'aceita' | 'em_andamento' | 'concluida' | 'cancelada';

const defaultData = {
  version: 1,
  updatedAt: new Date().toISOString(),
  driverPlanBenefits: {
    gratis: {
      prioridadeFila: 0,
      alertaSonoro: false,
      vantagens: ['Recebimento padrao de corridas']
    },
    basico: {
      prioridadeFila: 1,
      alertaSonoro: true,
      vantagens: ['Alerta sonoro de nova corrida', 'Prioridade media na fila', 'Selo motorista verificado']
    },
    premium: {
      prioridadeFila: 2,
      alertaSonoro: true,
      vantagens: ['Alerta sonoro reforcado', 'Prioridade alta na fila', 'Destaque no topo e corridas preferenciais']
    }
  },
  adsConfig: {
    enabled: true,
    showToFreePassengersOnly: true,
    cooldownMinutes: 30,
    popupTitle: 'Destrave vantagens no Moto Taxi',
    popupMessage: 'Assine e evite pop-ups durante as corridas.',
    items: [
      {
        id: 'ad_1',
        titulo: 'Plano Passageiro Basico',
        mensagem: 'Evite pop-ups e tenha prioridade no atendimento por apenas R$ 7,90/mes.',
        ctaLabel: 'Quero Assinar',
        ctaLink: '/planos',
        ativo: true
      }
    ]
  },
  drivers: [
    {
      id: 'drv_1',
      nome: 'Carlos Moto',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&q=80',
      telefone: '75999999999',
      veiculo: 'Honda CG 160',
      placa: 'ABC-1234',
      avaliacao: 4.8,
      plano: 'premium' as DriverPlan,
      online: true,
      latitude: -11.406,
      longitude: -39.461,
      cnhNumero: '00000000001',
      cnhValida: true,
      documentoVeiculoOk: true,
      licenciamentoVencimento: '2027-01-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'drv_2',
      nome: 'Paulo Freire',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80',
      telefone: '75988888888',
      veiculo: 'Yamaha Fazer 250',
      placa: 'DEF-5678',
      avaliacao: 4.9,
      plano: 'basico' as DriverPlan,
      online: true,
      latitude: -11.408,
      longitude: -39.459,
      cnhNumero: '00000000002',
      cnhValida: true,
      documentoVeiculoOk: true,
      licenciamentoVencimento: '2026-11-18',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  rides: [] as any[]
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    if (!Array.isArray(data.drivers)) data.drivers = [];
    if (!Array.isArray(data.rides)) data.rides = [];
    if (!data.adsConfig) data.adsConfig = defaultData.adsConfig;
    if (!data.driverPlanBenefits) data.driverPlanBenefits = defaultData.driverPlanBenefits;
    return data;
  } catch {
    return defaultData;
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2));
}

function getMetrics(data: any) {
  const rides = Array.isArray(data.rides) ? data.rides : [];
  const drivers = Array.isArray(data.drivers) ? data.drivers : [];
  const today = new Date().toISOString().slice(0, 10);
  const ridesToday = rides.filter((r: any) => String(r.createdAt || '').slice(0, 10) === today);
  const completed = rides.filter((r: any) => r.status === 'concluida');
  const concludedToday = ridesToday.filter((r: any) => r.status === 'concluida');
  const revenueToday = concludedToday.reduce((sum: number, r: any) => sum + Number(r.price || 0), 0);
  const avgTicket = completed.length
    ? completed.reduce((sum: number, r: any) => sum + Number(r.price || 0), 0) / completed.length
    : 0;

  const docAlerts = drivers.filter((d: any) => {
    const lic = new Date(d.licenciamentoVencimento || 0).getTime();
    const threshold = Date.now() + 1000 * 60 * 60 * 24 * 30;
    return !d.cnhValida || !d.documentoVeiculoOk || lic < threshold;
  }).length;

  return {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter((d: any) => d.online).length,
    compliantDrivers: drivers.filter((d: any) => d.cnhValida && d.documentoVeiculoOk).length,
    ridesToday: ridesToday.length,
    inProgress: rides.filter((r: any) => r.status === 'em_andamento').length,
    completedToday: concludedToday.length,
    pendingPayment: rides.filter((r: any) => r.paymentStatus === 'pendente').length,
    revenueToday,
    avgTicket: Number(avgTicket.toFixed(2)),
    cancellationRate: rides.length
      ? Number(((rides.filter((r: any) => r.status === 'cancelada').length / rides.length) * 100).toFixed(2))
      : 0,
    docAlerts
  };
}

function validateDriverPayload(payload: any) {
  const required = ['nome', 'telefone', 'veiculo', 'placa', 'cnhNumero', 'licenciamentoVencimento'];
  for (const field of required) {
    if (!payload?.[field]) {
      return `Campo obrigatorio ausente: ${field}`;
    }
  }

  const licDate = new Date(payload.licenciamentoVencimento);
  if (Number.isNaN(licDate.getTime())) {
    return 'Data de vencimento do licenciamento invalida.';
  }

  if (licDate.getTime() < Date.now()) {
    return 'Licenciamento vencido. Regularize para cadastrar.';
  }

  if (!payload?.cnhValida) {
    return 'CNH invalida. Nao e possivel concluir cadastro.';
  }

  if (!payload?.documentoVeiculoOk) {
    return 'Documentacao do veiculo invalida.';
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const data = readData();
    const { searchParams } = new URL(request.url);
    const recurso = searchParams.get('recurso') || 'drivers';
    const rideId = searchParams.get('rideId');
    const userId = searchParams.get('userId');
    const driverId = searchParams.get('driverId');

    if (recurso === 'drivers') {
      const onlyOnline = searchParams.get('online') === 'true';
      const drivers = onlyOnline ? data.drivers.filter((d: any) => d.online) : data.drivers;
      return NextResponse.json({ success: true, data: drivers, benefits: data.driverPlanBenefits });
    }

    if (recurso === 'rides') {
      let rides = data.rides;
      if (rideId) rides = rides.filter((r: any) => r.id === rideId);
      if (userId) rides = rides.filter((r: any) => r.passengerId === userId);
      if (driverId) rides = rides.filter((r: any) => r.driverId === driverId);
      return NextResponse.json({ success: true, data: rides });
    }

    if (recurso === 'ads') {
      return NextResponse.json({ success: true, data: data.adsConfig });
    }

    if (recurso === 'metrics') {
      return NextResponse.json({ success: true, data: getMetrics(data) });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = readData();
    const body = await request.json();
    const recurso = body?.recurso;

    if (recurso === 'drivers') {
      const error = validateDriverPayload(body);
      if (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
      }

      const driver = {
        id: `drv_${Date.now()}`,
        nome: String(body.nome),
        fotoUrl: String(body.fotoUrl || ''),
        telefone: String(body.telefone),
        veiculo: String(body.veiculo),
        placa: String(body.placa).toUpperCase(),
        avaliacao: Number(body.avaliacao || 5),
        plano: (body.plano || 'gratis') as DriverPlan,
        online: Boolean(body.online ?? true),
        latitude: Number(body.latitude || -11.406),
        longitude: Number(body.longitude || -39.461),
        cnhNumero: String(body.cnhNumero),
        cnhValida: Boolean(body.cnhValida),
        documentoVeiculoOk: Boolean(body.documentoVeiculoOk),
        licenciamentoVencimento: String(body.licenciamentoVencimento),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.drivers.unshift(driver);
      writeData(data);
      return NextResponse.json({ success: true, data: driver });
    }

    if (recurso === 'rides') {
      const required = ['passengerName', 'passengerId', 'driverId', 'origin', 'destination', 'price'];
      for (const field of required) {
        if (!body?.[field]) {
          return NextResponse.json({ success: false, error: `Campo obrigatorio: ${field}` }, { status: 400 });
        }
      }

      const driver = data.drivers.find((d: any) => d.id === body.driverId);
      if (!driver) {
        return NextResponse.json({ success: false, error: 'Motorista nao encontrado.' }, { status: 404 });
      }

      const ride = {
        id: `ride_${Date.now()}`,
        passengerName: String(body.passengerName),
        passengerId: String(body.passengerId),
        passengerPlan: String(body.passengerPlan || 'gratis'),
        driverId: String(driver.id),
        driverName: String(driver.nome),
        driverPhoto: String(driver.fotoUrl || ''),
        vehicle: String(driver.veiculo),
        plate: String(driver.placa),
        origin: body.origin,
        destination: body.destination,
        originLat: Number(body.originLat || driver.latitude),
        originLng: Number(body.originLng || driver.longitude),
        destinationLat: Number(body.destinationLat || driver.latitude + 0.005),
        destinationLng: Number(body.destinationLng || driver.longitude + 0.005),
        driverLat: Number(driver.latitude),
        driverLng: Number(driver.longitude),
        price: Number(body.price),
        paymentMethod: String(body.paymentMethod || 'pix'),
        paymentStatus: 'pendente',
        status: 'solicitada' as RideStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.rides.unshift(ride);
      writeData(data);
      return NextResponse.json({ success: true, data: ride });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao salvar.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = readData();
    const body = await request.json();
    const recurso = body?.recurso;

    if (recurso === 'ride_status') {
      const { rideId, status, paymentStatus } = body;
      const idx = data.rides.findIndex((r: any) => r.id === rideId);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Corrida nao encontrada.' }, { status: 404 });
      }

      data.rides[idx] = {
        ...data.rides[idx],
        status: status || data.rides[idx].status,
        paymentStatus: paymentStatus || data.rides[idx].paymentStatus,
        updatedAt: new Date().toISOString()
      };

      writeData(data);
      return NextResponse.json({ success: true, data: data.rides[idx] });
    }

    if (recurso === 'driver_location') {
      const { rideId, driverLat, driverLng, status } = body;
      const idx = data.rides.findIndex((r: any) => r.id === rideId);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Corrida nao encontrada.' }, { status: 404 });
      }

      data.rides[idx] = {
        ...data.rides[idx],
        driverLat: Number(driverLat),
        driverLng: Number(driverLng),
        status: status || data.rides[idx].status,
        updatedAt: new Date().toISOString()
      };

      writeData(data);
      return NextResponse.json({ success: true, data: data.rides[idx] });
    }

    if (recurso === 'ads') {
      data.adsConfig = {
        ...data.adsConfig,
        ...body.config,
        items: Array.isArray(body?.config?.items) ? body.config.items : data.adsConfig.items
      };
      writeData(data);
      return NextResponse.json({ success: true, data: data.adsConfig });
    }

    if (recurso === 'driver') {
      const { id, patch } = body;
      const idx = data.drivers.findIndex((d: any) => d.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Motorista nao encontrado.' }, { status: 404 });
      }

      data.drivers[idx] = {
        ...data.drivers[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
        alertaSonoroAtivo:
          patch?.plano
            ? ['basico', 'premium'].includes(String(patch.plano).toLowerCase())
            : data.drivers[idx].alertaSonoroAtivo
      };

      writeData(data);
      return NextResponse.json({ success: true, data: data.drivers[idx] });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao atualizar.' }, { status: 500 });
  }
}
