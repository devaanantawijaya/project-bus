interface IRute {
  namaRute: string;
  from: {
    loc: string;
    lat: number;
    lng: number;
  };
  to: {
    loc: string;
    lat: number;
    lng: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

export interface IProvinsi {
  namaProvinsi: string;
  rute: IRute[];
}

export const RutePerProvinsi: IProvinsi[] = [
  {
    namaProvinsi: "Bali",
    rute: [
      {
        namaRute: "GILIMANUK ⇄ DENPASAR",
        from: {
          loc: "GILIMANUK",
          lat: -8.177741,
          lng: 114.437648,
        },
        to: {
          loc: "DENPASAR",
          lat: -8.635151,
          lng: 115.206792,
        },
        center: {
          lat: -8.426359, 
          lng: 114.830094,
        },
      },
      {
        namaRute: "BULELENG ⇄ DENPASAR",
        from: {
          loc: "BULELENG",
          lat: -8.114204,
          lng: 115.079488,
        },
        to: {
          loc: "DENPASAR",
          lat: -8.635151,
          lng: 115.206792,
        },
        center: {
          lat: -8.364166,
          lng: 115.191672,
        },
      },
    ],
  },
  {
    namaProvinsi: "Jawa Timur",
    rute: [
      {
        namaRute: "BANYUWANGI ⇄ SURABAYA",
        from: {
          loc: "BANYUWANGI",
          lat: -8.119921,
          lng: 114.3984,
        },
        to: {
          loc: "SURABAYA",
          lat: -7.350609,
          lng: 112.724544,
        },
        center: {
          lat: -7.759148,
          lng: 113.228841,
        },
      },
    ],
  },
];
