import path from 'node:path';

const SEED_FOLDER = path.resolve(__dirname, '../../../../seed');

const gallery = (file: string): string => path.join(SEED_FOLDER, 'packages-demo', 'gallery', file);

const cover = (file: string): string => path.join(SEED_FOLDER, 'shared-safari', 'covers', file);

export type ParkPicturePlan = { readonly parkName: string; readonly picture: string };

export const PARK_PICTURES: readonly ParkPicturePlan[] = [
    { parkName: 'Achanakmar Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Amrabad Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Anamalai Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Bandhavgarh Tiger Reserve', picture: gallery('jeeps.jpg') },
    { parkName: 'Bandipur Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Bhadra Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Bhitarkanika National Park', picture: gallery('boat2.jpg') },
    { parkName: 'Bor Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Buxa Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Corbett Tiger Reserve', picture: gallery('elephant.jpg') },
    { parkName: 'Dudhwa Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Gir National Park', picture: gallery('leopard.jpg') },
    { parkName: 'Great Himalayan National Park', picture: cover('cover-1.jpg') },
    { parkName: 'Hemis National Park', picture: cover('cover-2.jpg') },
    { parkName: 'Jawai Leopard Safari', picture: cover('cover-3.jpg') },
    { parkName: 'Jhalana Leopard Reserve', picture: gallery('leopard.jpg') },
    { parkName: 'Kali Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Kangchenjunga National Park', picture: cover('cover-3.jpg') },
    { parkName: 'Kanha Tiger Reserve', picture: gallery('deer.jpg') },
    { parkName: 'Kawal Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Kaziranga Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Kuno National Park', picture: gallery('cheetah.jpg') },
    { parkName: 'Manas Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Melghat Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Mudumalai Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Mukandra Hills Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Nagarhole Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Nagarjunsagar-Srisailam Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Nanda Devi National Park', picture: cover('cover-2.jpg') },
    { parkName: 'Nawegaon-Nagzira Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Orang Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Pakke Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Palamau Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Panna Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Parambikulam Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Pench Tiger Reserve - Madhya Pradesh', picture: cover('cover-3.jpg') },
    { parkName: 'Pench Tiger Reserve - Maharastra', picture: cover('cover-1.jpg') },
    { parkName: 'Peppara Wildlife Sanctuary', picture: cover('cover-2.jpg') },
    { parkName: 'Periyar Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Pilibhit Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Pin Valley National Park', picture: cover('cover-2.jpg') },
    { parkName: 'Rajaji Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Ramgarh Vishdhari Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Ranthambore Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Ripu-Chirang Reserve Forest', picture: cover('cover-3.jpg') },
    { parkName: 'Sahyadri Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Sanjay-Dubri Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Sariska Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Satpura Tiger Reserve', picture: gallery('jeeps.jpg') },
    { parkName: 'Similipal Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Singalila National Park', picture: cover('cover-3.jpg') },
    { parkName: 'Sundarbans Tiger Reserve', picture: cover('cover-1.jpg') },
    { parkName: 'Tadoba-Andhari Tiger Reserve', picture: cover('cover-2.jpg') },
    { parkName: 'Udanti-Sitanadi Tiger Reserve', picture: cover('cover-3.jpg') },
    { parkName: 'Valmiki Tiger Reserve', picture: cover('cover-1.jpg') },
];

export const SAMPLE_PICTURES: readonly string[] = [...new Set(PARK_PICTURES.map((plan) => plan.picture))];
