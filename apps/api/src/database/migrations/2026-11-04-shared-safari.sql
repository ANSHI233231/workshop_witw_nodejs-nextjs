-- Shared Safari: the parks it is organised in (park module: master_park) and the safaris themselves (shared-safari
-- module): who organises and joins them, their discussion, flags on comments, and the Flag Reasons master.
-- Plan: docs/planning/features/2026-11-04-shared-safari.md
-- Workflow: docs/how-it-works/workflows/WITW-Shared-Safari-Workflow.md
--
-- master_park: master data. Starts with the 55 active Walk Into The Wild parks below; the admin adds parks, edits their
--   name, region and average price, and makes them active or inactive in Console › Parks. No park is deleted. slug is
--   made from the name when a park is added and never changes. Only active parks are offered in the Organise form and
--   the website's Safari Park filter; making a park inactive leaves the safaris already planned there as they are (a
--   host editing one must pick an active park again). short_description, feature_image, latitude / longitude and
--   official_website come from this data only (no screen edits them); feature_image is empty here.
--   avg_safari_price_min / _max are rupees per safari, up to 10,00,000 (the API's limit, as a safari's price per
--   person): both set or both NULL (not known).
--
-- shared_safari: one row per safari. user_id is the host (the user who organised it). slug is set once, when the safari
--   is created, and never changes. start_date / end_date are the trip's calendar dates (DATE, not timestamps); a safari
--   whose start_date has passed is over by date alone (only the "Over" mark in My Shared Safaris; it
--   stays listed, joinable and open to comments). safari_count is the number of game drives;
--   total_seats is the vehicle (the host included), shared_seats how many the host offers (fewer than total_seats).
--   price_per_person_min / _max are whole rupees. cover_image is the stored file's name only (empty = the default WITW
--   cover); the file is at shared_safari/<id>/cover_image/<cover_image> in the app's file storage
--   (docs/how-it-works/platform/file-storage.md).
--   safari_plan is the host's full text; the website masks phone numbers and emails when it shows it.
--   Host delete is final: status -1 with deleted_at / deleted_by. Admin delete is status 4 with delete_reason and
--   delete_details, plus deleted_at / deleted_by; Make active returns it to 1 and clears all four.
--   is_pinned orders the console list only (pinned first, then newest); deleting a safari keeps its pin.
--   Dates are counted in Indian time (IST): "today", started / over, and the date limits.
-- shared_safari_member: one row per safari and user (the unique key). Joining shows interest and takes no seat.
--   joined_at / left_at are the last join and leave (the website shows current members with joined_at; the console's
--   Left list shows left_at; no history is kept); first_joined_at is the first join, so a join after a leave doesn't
--   notify the host again. The host never has a row.
-- shared_safari_comment: comments and replies. shared_safari_comment_id is the comment a reply answers (empty for a
--   comment; one level only). The writer can edit their own text (no "edited" mark is shown) and delete it; a delete
--   by the writer or the admin sets status -1 (deleted_by says who); deleting a comment sets -1 on its replies too.
--   A member's comments stay after they leave. comment_text is TEXT: the API limits it to fewer than 200 words.
-- shared_safari_comment_flag: one row per flag a signed-in user raises on someone else's comment or reply; the same
--   user can flag the same comment any number of times, each a row.
--   master_flag_reason_id is the reason chosen ("Used in flags" counts by it); reason_name is its name at that moment,
--   which the flag keeps and shows, so renaming or deactivating a reason doesn't change past flags. details is up
--   to 500 characters (the API's limit). Flags can be raised on a started safari's comments too. Ignore and
--   Delete in Flagged Comments close every open flag of the comment (updated_at / updated_by record when and who).
-- master_flag_reason: the reasons offered in the website's Flag dialog, managed in Console › Flag Reasons (no delete).
--   name is unique regardless of case (the collation is case-insensitive). There is no separate order: the dialog and
--   the console list them in the order they were added (by id). Starts with the 8 reasons below. The admin's reasons for
--   deleting a safari are a separate fixed list in code.
--
-- Codes (the lists live in the modules' types/: park/types/park.types.ts, shared-safari/types/shared-safari.types.ts):
--   master_park.region                   1 = North India, 2 = Central India, 3 = West India, 4 = East India,
--                                        5 = South India, 6 = North East India
--   master_park.status                   1 = active, 2 = inactive
--   shared_safari.theme                  1 = Photography, 2 = Safari Experience
--   shared_safari.stay_category          1 = Premium, 2 = Standard, 3 = Economical, 4 = Not Included,
--                                        5 = Forest Rest House, 6 = Home Stay
--   shared_safari.status                 1 = active, 2 = inactive, 3 = seat full, 4 = deleted by admin,
--                                        -1 = deleted by host
--   shared_safari.delete_reason          1 = Abusive or Illegal, 2 = Commercial or Spam, 3 = Dating / Sexually Explicit,
--                                        4 = Felt Unsafe, 5 = Shows My Private Information, 6 = Violates Guidelines,
--                                        7 = Off Topic, 8 = Other
--   shared_safari_member.status          1 = joined, 2 = left
--   shared_safari_comment.status         1 = active, -1 = deleted
--   shared_safari_comment_flag.status    1 = open, 2 = ignored, 3 = closed (the comment was deleted)
--   master_flag_reason.status            1 = active, 2 = inactive
--   notification_template.notification_kind  801 = someone joined your safari, 802 = someone commented on your safari
--   audit module (audit_log)              8 = shared-safari (actions 801…), 9 = park (actions 901…)

CREATE TABLE master_park (
    id                    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(150)  NOT NULL,
    slug                  VARCHAR(150)  NOT NULL,
    region                TINYINT       NOT NULL,
    short_description     VARCHAR(1000) NULL,
    feature_image         VARCHAR(255)  NULL,
    avg_safari_price_min  INT UNSIGNED  NULL,
    avg_safari_price_max  INT UNSIGNED  NULL,
    latitude              DECIMAL(10,7) NULL,
    longitude             DECIMAL(10,7) NULL,
    official_website      VARCHAR(255)  NULL,
    status                TINYINT       NOT NULL DEFAULT 1,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by            INT UNSIGNED  NULL,
    updated_by            INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_master_park_name (name),
    UNIQUE KEY uq_master_park_slug (slug),
    KEY idx_master_park_status_name (status, name),
    KEY idx_master_park_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_park (name, slug, region, short_description, avg_safari_price_min, avg_safari_price_max, latitude, longitude, official_website) VALUES
('Achanakmar Tiger Reserve', 'achanakmar-tiger-reserve', 2, 'Achanakmar Tiger Reserve, located in Chhattisgarh, India, spans 557.55 square kilometers. It\'s a lush sanctuary home to Bengal tigers, leopards, and a diverse range of flora and fauna. Established in 1975, this reserve is part of the Achanakmar-Amarkantak Biosphere Reserve. The dense forests, hilly terrain, and rich biodiversity make it a vital habitat and a captivating destination for wildlife enthusiasts.', 3500, 4500, 22.482019, 81.784562, 'https://www.tigersofachanakmar.org/gypsy_booking'),
('Amrabad Tiger Reserve', 'amrabad-tiger-reserve', 5, 'Amrabad Tiger Reserve, located in Telangana, India, spans over 2,800 square kilometers. It is one of India\'s largest tiger reserves, home to Bengal tigers, leopards, sloth bears, and a variety of deer species. The reserve\'s dense forests, deep valleys, and rich biodiversity offer a crucial habitat for wildlife. It also features the scenic Srisailam reservoir and the historic Nagalapuram fort.', 6000, 7000, 16.267919, 78.721559, 'https://amrabadtigerreserve.com/booking/'),
('Anamalai Tiger Reserve', 'anamalai-tiger-reserve', 5, 'Anamalai Tiger Reserve, located in the Western Ghats of Tamil Nadu, India, is a biodiversity hotspot renowned for its rich flora and fauna. Spanning over 960 square kilometers, it features dense forests, grasslands, and various ecosystems. The reserve is home to Bengal tigers, Indian elephants, and numerous bird species. It\'s a vital conservation area for endangered wildlife and a popular destination for nature enthusiasts.', 3000, 5000, 10.4733618, 76.9541563, 'https://www.atrpollachi.com/'),
('Bandhavgarh Tiger Reserve', 'bandhavgarh-tiger-reserve', 2, 'Situated in Madhya Pradesh, Bandhavgarh Tiger Reserve is famous for its high tiger density and historical significance. The reserve features diverse terrains, including grasslands, forests, and ancient ruins. Jeep safaris offer thrilling tiger sightings and views of leopards, deer, and exotic birds. Bandhavgarh also boasts the ancient Bandhavgarh Fort, adding a cultural dimension to the wildlife experience.', 7000, 9000, 23.721942, 81.019378, 'https://forest.mponline.gov.in/'),
('Bandipur Tiger Reserve', 'bandipur-tiger-reserve', 5, 'Bandipur Tiger Reserve, located in Karnataka, India, is renowned for its rich biodiversity and vital Bengal tiger habitat. Spanning lush tropical forests, it shelters wildlife such as elephants, gaurs, sloth bears, and numerous bird species. Conservation efforts focus on habitat protection and sustainable tourism. Bandipur\'s scenic landscapes and diverse fauna make it a popular destination for nature enthusiasts and wildlife photographers.', 4000, 6000, 11.693962, 76.635841, 'https://bandipurtigerreserve.org/'),
('Bhadra Tiger Reserve', 'bhadra-tiger-reserve', 5, 'Bhadra Tiger Reserve, located in Karnataka, India, spans 492 square kilometers. It is renowned for its rich biodiversity, including Bengal tigers, leopards, elephants, and various bird species. The reserve features lush forests, the scenic Bhadra River, and the picturesque Bhadra Dam. Established in 1998, it plays a crucial role in wildlife conservation and offers captivating opportunities for eco-tourism and wildlife safaris.', 4000, 5000, 13.676467, 75.662013, 'https://karnatakatourism.org/tour-item/bhadra-wildlife-sanctuary-and-tiger-reserve/'),
('Bhitarkanika National Park', 'bhitarkanika-national-park', 4, 'Bhitarkanika, located in Odisha, is a unique mangrove ecosystem renowned for its saltwater crocodiles and rich biodiversity. It is a haven for birds, reptiles, and aquatic life, offering a pristine glimpse into India’s coastal wilderness.', NULL, NULL, 20.7213839, 86.8684941, NULL),
('Bor Tiger Reserve', 'bor-tiger-reserve', 3, 'Bor Tiger Reserve, located in Maharashtra, India, spans 138 square kilometers. Established in 2014, it is known for its thriving Bengal tiger population, along with leopards, sloth bears, and diverse bird species. The reserve\'s mix of dry deciduous forests, bamboo groves, and water bodies supports rich biodiversity. Bor is a critical conservation area and a picturesque destination for wildlife enthusiasts.', 4000, 6000, 20.9563427, 78.6875904, 'https://safaribooking.mahaforest.gov.in/'),
('Buxa Tiger Reserve', 'buxa-tiger-reserve', 4, 'Buxa Tiger Reserve, located in West Bengal, India, spans over 760 square kilometers. It is known for its rich biodiversity, including Bengal tigers, Indian elephants, leopards, and a variety of bird species. The reserve features dense forests, picturesque rivers, and historical sites like Buxa Fort. Established in 1983, it plays a crucial role in wildlife conservation and offers captivating opportunities for eco-tourism and wildlife enthusiasts.', 3000, 5000, 26.6209081, 89.5306593, 'https://www.wbtourism.gov.in/Wildlife/details?template_id=1&id=63e90cfa0e6185b3d60e9407'),
('Corbett Tiger Reserve', 'corbett-tiger-reserve', 1, 'Located in Uttarakhand, Corbett Tiger Reserve is India\'s oldest national park, established in 1936. It is renowned for its rich biodiversity and large tiger population. Visitors can enjoy jeep safaris, bird watching, and scenic landscapes, including rivers and dense forests. The reserve is a haven for wildlife enthusiasts, offering glimpses of elephants, leopards, and various bird species.', 7000, 8000, 29.5261, 79.099519, 'https://corbettgov.org/'),
('Dudhwa Tiger Reserve', 'dudhwa-tiger-reserve', 1, 'Dudhwa Tiger Reserve, in Uttar Pradesh, India, covers 490 square kilometers. It is home to Bengal tigers, Indian rhinoceros, leopards, and elephants. The reserve features dense sal forests, grasslands, and wetlands, supporting rich biodiversity. Rare birds like the Bengal florican can be spotted here. Dudhwa focuses on conserving endangered species and maintaining the ecological balance of the Terai ecosystem.', 4000, 5000, 28.465838, 80.619582, 'https://upecotourism.in/CheckAvailability.aspx'),
('Gir National Park', 'gir-national-park', 3, 'Gir National Park, located in Gujarat, India, spans over 1,400 square kilometers. It is the only place in the world where Asiatic lions can be seen in their natural habitat. The park also hosts leopards, deer, antelope, and diverse bird species. Established in 1965, Gir is a crucial conservation area and offers unique wildlife experiences for visitors and nature enthusiasts.', 4000, 5000, 21.16898, 70.5984588, 'https://girlion.gujarat.gov.in/GirJungleTrailBooking.aspx'),
('Great Himalayan National Park', 'great-himalayan-national-park', 1, 'Great Himalayan National Park, located in Himachal Pradesh, India, spans approximately 1,171 square kilometers. Established in 1984, it features diverse landscapes, including dense forests, alpine meadows, and glacial valleys. The park is home to various wildlife, including the snow leopard, Himalayan tahr, and musk deer. Recognized as a UNESCO World Heritage Site, it plays a crucial role in preserving the region\'s biodiversity and natural heritage.', NULL, NULL, 31.7987579, 77.5163223, 'https://www.greathimalayannationalpark.org/'),
('Hemis National Park', 'hemis-national-park', 1, 'Hemis National Park, located in Ladakh, India, spans approximately 4,400 square kilometers. Established in 1981, it is renowned for its rugged terrain, high-altitude deserts, and alpine meadows. The park is a key habitat for the endangered snow leopard and supports diverse wildlife, including Tibetan wolves and bharal (blue sheep). Hemis is also home to ancient monasteries and unique Himalayan flora.', NULL, NULL, 33.7586344, 77.3683476, NULL),
('Jawai Leopard Safari', 'jawai-leopard-safari', 3, 'Jawai, located in Rajasthan, India, is renowned for its unique landscape of granite hills and grasslands. This region is famous for its leopard population, which coexists harmoniously with local communities. Jawai also features a picturesque dam, attracting migratory birds and crocodiles. Offering a blend of wildlife and cultural experiences, Jawai is a captivating destination for nature enthusiasts and wildlife photographers.', 4000, 6000, 25.0990146, 73.142545, NULL),
('Jhalana Leopard Reserve', 'jhalana-leopard-conservation-reserve', 3, 'Jhalana Leopard Conservation Reserve, located in Jaipur, India, spans 20 square kilometers and is renowned for its thriving leopard population, with around 30-35 leopards. This urban wildlife sanctuary also hosts deer, blue bulls, hyenas, and numerous bird species. Jhalana’s proximity to the city allows easy access for wildlife enthusiasts, fostering education and conservation efforts. It stands as a remarkable model of coexistence between urban development and wildlife conservation.', 5000, 6000, 26.855245, 75.833594, 'https://aaranyak.forest.rajasthan.gov.in/MiddleWare/SubModuleFMDSS1?linkparam=YdgSMPLU6mrPPz6aVjWElAjRGk9WE1sdwTdQCGGBVRxaZOjYqEOdEQ=='),
('Kali Tiger Reserve', 'kali-tiger-reserve', 5, 'Kali Tiger Reserve, located in Karnataka, India, spans over 1,300 square kilometers and is named after the Kali River that flows through it. This reserve is known for its dense forests and rich biodiversity, including Bengal tigers, black panthers, elephants, and numerous bird species. Established in 1987, it plays a vital role in wildlife conservation and offers a serene environment for nature enthusiasts.', 5000, 6000, 15.1607136, 74.6096285, 'https://www.junglelodges.com/resort/kali-adventure-camp/'),
('Kangchenjunga National Park', 'kangchenjunga-national-park', 6, 'Kangchenjunga National Park, located in Sikkim, India, spans approximately 1,784 square kilometers. Established in 1977, it encompasses the majestic Kangchenjunga peak and features diverse landscapes, including glaciers, forests, and alpine meadows. The park is home to unique wildlife such as the snow leopard and red panda. Recognized as a UNESCO World Heritage Site, it plays a vital role in biodiversity conservation and cultural heritage.', NULL, NULL, 27.6844011, 88.3920526, NULL),
('Kanha Tiger Reserve', 'kanha-tiger-reserve', 2, 'Kanha Tiger Reserve, also known as Kanha–Kisli National Park, is one of the tiger reserves of India and the largest national park of the state of Madhya Pradesh.', 7000, 9000, 22.154756, 80.672751, 'https://forest.mponline.gov.in/'),
('Kawal Tiger Reserve', 'kawal-tiger-reserve', 5, 'Kawal Tiger Reserve, located in Telangana, India, spans over 893 square kilometers. It is known for its lush deciduous forests and diverse wildlife, including Bengal tigers, leopards, sloth bears, and various deer species. Established in 2012, the reserve also supports a rich bird life, making it a crucial area for conservation. It offers excellent opportunities for Eco-tourism and wildlife enthusiasts.', 3000, 4000, 19.1565428, 78.8762146, 'https://telanganatourism.gov.in/partials/destinations/wildlife/mancherial/kawal-wildlife-sanctuary.html'),
('Kaziranga Tiger Reserve', 'kaziranga-tiger-reserve', 6, 'Kaziranga Tiger Reserve, located in Assam, India, spans approximately 1,030 square kilometers. Established in 2007, it is renowned for its high density of Bengal tigers and as a UNESCO World Heritage Site. The reserve also boasts the world\'s largest population of Indian one-horned rhinoceroses, alongside elephants, wild water buffalo, and diverse bird species. Kaziranga\'s diverse habitats include grasslands, wetlands, and dense forests, offering rich biodiversity and spectacular wildlife viewing opportunities.', 3500, 4500, 26.589364, 93.400903, 'https://kazirangasafari.in/booking'),
('Kuno National Park', 'kuno-national-park', 2, 'Kuno National Park, located in Madhya Pradesh, is one of India’s most diverse and vibrant wildlife habitats. Originally established as a sanctuary, it gained prominence for hosting India’s ambitious Cheetah Reintroduction Project. Spread over nearly 750 square kilometers, Kuno is home to rich flora and fauna, including leopards, nilgai, chital, and a variety of birds, set against a backdrop of dry deciduous forests and grasslands.', 5000, 7000, 25.7508083, 77.1131346, NULL),
('Manas Tiger Reserve', 'manas-tiger-reserve', 6, 'Manas Tiger Reserve in Assam, India, is a UNESCO World Heritage site renowned for its biodiversity. It shelters Bengal tigers, Indian rhinoceroses, pygmy hogs, and wild water buffaloes. The reserve\'s diverse habitats also support over 450 bird species, making it a hotspot for birdwatchers. Conservation efforts at Manas aim to safeguard its rich ecosystem, playing a crucial role in preserving endangered wildlife and their habitats.', 3500, 4500, 26.659314, 91.001075, 'https://manasnptr.in/user/index'),
('Melghat Tiger Reserve', 'melghat-tiger-reserve', 3, 'Melghat Tiger Reserve, located in Maharashtra, India, covers 1,676 square kilometers. It is known for its diverse ecosystem, featuring dry deciduous forests. The reserve is home to Bengal tigers, leopards, sloth bears, gaur, and various deer species. It also hosts numerous bird species, including the endangered forest owlet. Conservation efforts focus on protecting its rich biodiversity and supporting tiger population growth.', 4000, 6000, 21.405319, 77.147992, 'https://www.magicalmelghat.in/'),
('Mudumalai Tiger Reserve', 'mudumalai-tiger-reserve', 5, 'Mudumalai Tiger Reserve in Tamil Nadu, India, features diverse habitats from tropical forests to scrublands. It hosts Bengal tigers, Indian elephants, leopards, and gaurs. With over 250 bird species, it\'s a hotspot for birdwatchers. Conservation efforts emphasize habitat protection and sustainable tourism, ensuring the preservation of its rich biodiversity.', 2000, 3000, 11.581053, 76.582254, 'https://www.mudumalaitigerreserve.com/'),
('Mukandra Hills Tiger Reserve', 'mukandra-hills-tiger-reserve', 3, 'Mukandra Hills Tiger Reserve, located in Rajasthan, India, spans over 759 square kilometers. Established in 2013, it features rugged terrain with hills, valleys, and dense forests. The reserve is home to Bengal tigers, leopards, sloth bears, and various deer species. It also plays a crucial role in wildlife conservation and offers opportunities for Eco-tourism and wildlife safaris.', 4000, 6000, 24.9639969, 75.6723582, 'https://aaranyak.forest.rajasthan.gov.in/'),
('Nagarhole Tiger Reserve', 'nagarhole-tiger-reserve', 5, 'Nagarhole Tiger Reserve, situated in Karnataka, India, spans 643 square kilometers and is part of the Nilgiri Biosphere Reserve. Renowned for its rich biodiversity, it features dense forests, streams, and waterfalls. Home to tigers, elephants, leopards, and over 250 bird species, the reserve offers a pristine wildlife experience. Its name, "Nagarhole," translates to "Snake River," reflecting the area\'s winding streams and lush landscape.', 700, 1000, 12.071545, 76.150717, 'https://www.nagaraholetigerreserve.com/'),
('Nagarjunsagar-Srisailam Tiger Reserve', 'nagarjunsagar-srisailam-tiger-reserve', 5, 'Nagarjunsagar-Srisailam Tiger Reserve, located in the states of Andhra Pradesh and Telangana, India, spans over 3,568 square kilometers, making it the largest tiger reserve in India. Established in 1983, it features diverse landscapes including dense forests, valleys, and plateaus. The reserve is home to Bengal tigers, leopards, Indian giant squirrels, and numerous bird species, playing a crucial role in wildlife conservation.', 3000, 8000, 15.9943513, 78.9118639, 'https://nstr.co.in/'),
('Nanda Devi National Park', 'nanda-devi-biosphere-reserve', 1, 'Nanda Devi National Park, located in Uttarakhand, India, covers approximately 630 square kilometers. Established in 1982, it features the majestic Nanda Devi peak and diverse landscapes, including glaciers, alpine meadows, and dense forests. The park is home to rare wildlife like the snow leopard and Himalayan musk deer. A UNESCO World Heritage Site, it plays a crucial role in biodiversity conservation and mountain ecology.', NULL, NULL, 30.710048, 79.7563491, 'https://uttarakhandtourism.gov.in/destination/nanda-devi-national-park'),
('Nawegaon-Nagzira Tiger Reserve', 'nawegaon-nagzira-tiger-reserve', 3, 'Navegaon-Nagzira Tiger Reserve, located in Maharashtra, India, spans 653 square kilometers. Established in 2012, it combines the Navegaon National Park and Nagzira Wildlife Sanctuary. The reserve provides crucial habitat for tigers and other wildlife. Its diverse landscapes include forests, lakes, and hills, offering rich biodiversity and supporting conservation efforts in the region.', 4000, 6000, 21.2692986, 79.9578386, 'https://nationalpark.mahaonline.gov.in/User/Availability.aspx'),
('Orang Tiger Reserve', 'orang-tiger-reserve', 6, 'Orang Tiger Reserve, located in Assam, India, spans approximately 492 square kilometers. Established in 1985, it is also known as Rajiv Gandhi Orang National Park. The reserve features a diverse landscape of grasslands, wetlands, and forests, providing crucial habitat for the Bengal tiger and other wildlife. It is renowned for its rich biodiversity, including a significant population of the greater one-horned rhinoceros.', 2500, 3000, 26.5883714, 92.3081119, 'https://orangnptr.in/'),
('Pakke Tiger Reserve', 'pakke-tige-reserve', 6, 'Pakke Tiger Reserve, also known as Pakhui, is a biodiversity-rich forest reserve in Arunachal Pradesh, located in the Eastern Himalayan foothills. Known for its dense evergreen forests, it is home to tigers, elephants, leopards, clouded leopards, and rich birdlife including several hornbill species.', 4000, 6000, 26.9387058, 92.9784419, NULL),
('Palamau Tiger Reserve', 'palamau-tiger-reserve', 4, 'Palamu Tiger Reserve, located in Jharkhand, India, spans 1,026 square kilometers. Established in 1974, it was among the first nine tiger reserves under Project Tiger. The reserve\'s landscape includes forests, hills, and rivers, offering a rich biodiversity. It is home to various wildlife, including the Bengal tiger, and plays a crucial role in conservation efforts in the region.', 1500, 2000, 23.6852083, 84.2358177, 'https://www.palamautigerreserve.in/'),
('Panna Tiger Reserve', 'panna-tiger-reserve', 2, 'Panna Tiger Reserve, located in Madhya Pradesh, India, spans over 542 square kilometers. Established in 1981, it is renowned for its successful tiger reintroduction program. The reserve features diverse habitats, including dry deciduous forests, open grasslands, and riverine areas along the Ken River. Apart from tigers, it hosts leopards, gharials, and numerous bird species, making it a crucial biodiversity hotspot and a popular destination for wildlife enthusiasts.', 7000, 9000, 24.730568, 80.010289, 'https://forest.mponline.gov.in/'),
('Parambikulam Tiger Reserve', 'parambikulam-tiger-reserve', 5, 'Parambikulam Tiger Reserve, in Kerala\'s Palakkad district, spans 643.66 sq km and is renowned for its biodiversity and thriving tiger population. The reserve features evergreen forests, grasslands, and rivers, supporting numerous endangered species. It plays a vital role in wildlife conservation and eco-tourism, offering a serene escape for nature enthusiasts and a haven for endangered species.', 500, 1500, 10.443694, 76.813436, 'https://www.parambikulam.org/'),
('Pench Tiger Reserve - Madhya Pradesh', 'pench-tiger-reserve-madhya-pradesh', 2, 'Pench Tiger Reserve, located in Madhya Pradesh, India, spans 758 square kilometers and is renowned for its rich biodiversity. Established in 1992, the reserve inspired Rudyard Kipling\'s "The Jungle Book." It is home to Bengal tigers, leopards, wild dogs, and a variety of bird species. The landscape features teak forests, grasslands, and the Pench River, offering excellent wildlife viewing and safari experiences.', 7000, 9000, 21.739045, 79.336976, 'https://forest.mponline.gov.in/'),
('Pench Tiger Reserve - Maharastra', 'pench-tiger-reserve-maharastra', 3, 'Pench Tiger Reserve in Maharashtra spans over 741 square kilometers and is famed for its rich biodiversity and significant tiger population. Named after the Pench River, the reserve is home to various wildlife species including leopards, deer, and a variety of birds. The lush deciduous forests and picturesque landscapes offer a perfect habitat for wildlife, making it a prime destination for nature lovers and wildlife enthusiasts.', 7000, 9000, 21.577269, 79.28748, 'https://safaribooking.mahaforest.gov.in/'),
('Peppara Wildlife Sanctuary', 'peppara-wildlife-sanctuary', 5, 'Peppara Wildlife Sanctuary, located in the Western Ghats of Kerala, India, covers approximately 53 square kilometers. It features tropical forests, grasslands, and the Peppara Dam. The sanctuary is home to diverse wildlife, including elephants, tigers, leopards, and various bird species. It plays a crucial role in conserving the region\'s biodiversity and is a popular spot for eco-tourism and nature exploration.', NULL, NULL, 8.6233073, 77.1384951, 'https://www.keralatourism.org/destination/peppara-wildlife-sanctuary-thiruvananthapuram/242'),
('Periyar Tiger Reserve', 'periyar-tiger-reserve', 5, 'Periyar Tiger Reserve, located in Kerala, India, is a renowned wildlife sanctuary and a part of the Western Ghats. Spanning around 925 square kilometers, it features lush forests, grasslands, and the scenic Periyar Lake. The reserve is famous for its Bengal tigers, Indian elephants, and diverse bird species. It is a key area for wildlife conservation and a popular destination for Eco-tourism and nature enthusiasts.', 6000, 8000, 9.6034726, 77.1671315, 'https://www.periyartigerreserve.org/Login'),
('Pilibhit Tiger Reserve', 'pilibhit-tiger-reserve', 1, 'Pilibhit Tiger Reserve, located in Uttar Pradesh, India, spans 730 square kilometers. Established in 2008, it features a diverse landscape of forests, grasslands, and wetlands. The reserve is a critical habitat for the Bengal tiger and other wildlife. It is bordered by the Sharda River and Nepal, contributing to its rich biodiversity and significant role in regional conservation efforts.', 4000, 5000, 28.6893741, 80.079217, 'https://pilibhittigerreserve.in/'),
('Pin Valley National Park', 'pin-valley-national-park', 1, 'Pin Valley National Park, located in Himachal Pradesh, India, spans approximately 675 square kilometers. Established in 1987, it is nestled in the cold desert region of the Spiti Valley. The park features stark landscapes, high-altitude meadows, and glacial valleys. It is home to unique wildlife such as the snow leopard and Siberian ibex. The park is vital for conserving the region\'s fragile ecosystem and biodiversity.', NULL, NULL, 31.9997213, 77.8834575, 'https://hplahaulspiti.nic.in/pin-valley-national-park/'),
('Rajaji Tiger Reserve', 'rajaji-tiger-reserve', 1, 'Rajaji Tiger Reserve, located in Uttarakhand, India, spans approximately 820 square kilometers. Established in 1983, it encompasses diverse landscapes, including forests, grasslands, and rivers. The reserve is renowned for its rich biodiversity, including the Bengal tiger, elephants, and numerous bird species. It is situated in the foothills of the Himalayas and serves as an important wildlife corridor between the Shivalik Hills and the Terai region.', 4000, 6000, 29.9711056, 78.2114719, 'https://rajajitigerreserve.uk.gov.in/'),
('Ramgarh Vishdhari Tiger Reserve', 'ramgarh-vishdhari-tiger-reserve', 3, 'Ramgarh Vishdhari Tiger Reserve, situated in Rajasthan, India, covers around 1,118 square kilometers. Established in 2021, it is part of the rich biodiversity corridor connecting Ranthambore National Park and the Kuno National Park. The reserve features varied landscapes including forests, grasslands, and hills. It is crucial for conserving the Bengal tiger and other wildlife while supporting ecological connectivity in the region.', 4000, 6000, 25.4767143, 75.662604, 'https://aaranyak.forest.rajasthan.gov.in/'),
('Ranthambore Tiger Reserve', 'ranthambore-tiger-reserve', 3, 'Ranthambore National Park stands out as a pinnacle of Indian wildlife, renowned for its diverse ecosystem. The park’s landscape, enriched with natural beauty, enhances its appeal as one of India’s most captivating wildlife sanctuaries.', 8000, 10000, 26.04751, 76.420062, 'https://aaranyak.forest.rajasthan.gov.in/MiddleWare/SubModuleFMDSS1?linkparam=YdgSMPLU6mrPPz6aVjWElAjRGk9WE1sdwTdQCGGBVRxaZOjYqEOdEQ=='),
('Ripu-Chirang Reserve Forest', 'chirang-reserve-forest', 6, 'Ripu-Chirang Reserve Forest, located in Assam, India, is an important conservation area within the Bodo Territorial Region. Covering approximately 1,202 square kilometers, it encompasses diverse ecosystems, including dense forests and grasslands. The reserve is home to a variety of wildlife, including elephants, tigers, and rhinos, and plays a crucial role in preserving the region\'s rich biodiversity and ecological balance.', NULL, NULL, 26.549285, 90.7065395, NULL),
('Sahyadri Tiger Reserve', 'sahyadri-tiger-reserve', 3, 'Sahyadri Tiger Reserve, located in Maharashtra, India, spans approximately 1,166 square kilometers. Established in 2008, it encompasses the Western Ghats\' lush landscapes, including forests, grasslands, and river valleys. The reserve is home to the Bengal tiger, leopards, and diverse wildlife species. It plays a crucial role in preserving the region\'s biodiversity and maintaining ecological balance within the Western Ghats\' unique ecosystem.', 500, 1000, 17.3473931, 73.6731913, 'https://www.sahyadritigers.org/index.php'),
('Sanjay-Dubri Tiger Reserve', 'sanjay-dubri-tiger-reserve', 2, 'Sanjay Dubri Tiger Reserve, located in Madhya Pradesh, India, spans approximately 1,500 square kilometers. Established in 1981, it encompasses diverse landscapes including dense forests, grasslands, and riverine areas. The reserve is home to the Bengal tiger, along with other wildlife such as leopards, wild boars, and various deer species. It plays a crucial role in conservation and maintaining regional ecological balance.', 4000, 5000, 24.0741811, 81.5712849, 'https://forest.mponline.gov.in/'),
('Sariska Tiger Reserve', 'sariska-tiger-reserve', 3, 'Sariska Tiger Reserve, located in Rajasthan, India, covers approximately 881 square kilometers. Established in 1978, it is renowned for its diverse landscapes, including dry deciduous forests, grasslands, and rocky terrain. The reserve is home to the Bengal tiger, along with leopards, deer, and various bird species. It plays a vital role in conservation and is part of the Aravalli Range\'s ecological network.', 8000, 9000, 27.3919541, 76.375266, 'https://aaranyak.forest.rajasthan.gov.in/MiddleWare/SubModuleFMDSS1?linkparam=YdgSMPLU6mrPPz6aVjWElAjRGk9WE1sdwTdQCGGBVRxaZOjYqEOdEQ=='),
('Satpura Tiger Reserve', 'satpura-tiger-reserve', 2, 'Satpura Tiger Reserve, located in Madhya Pradesh, India, spans approximately 1,500 square kilometers of rugged terrain, dense forests, and diverse wildlife. Established in 1981, it is part of the Satpura Range and renowned for its population of Bengal tigers, leopards, sloth bears, and a variety of bird species. The reserve offers unique wildlife experiences through jeep safaris, walking trails, and boat rides, emphasizing conservation and eco-tourism.', 7000, 9000, 22.576499, 78.14383, 'https://forest.mponline.gov.in/'),
('Similipal Tiger Reserve', 'similipal-tiger-reserve', 4, 'Similipal Tiger Reserve, located in Odisha, India, covers approximately 2,750 square kilometers. Established in 1973, it is part of the Similipal Biosphere Reserve and features diverse landscapes including dense forests, grasslands, and rivers. The reserve is home to the Bengal tiger, Indian elephants, and numerous bird species. Its rich biodiversity and unique ecosystems make it a critical area for wildlife conservation in eastern India.', 6000, 8000, 21.9519833, 86.0708179, 'https://www.similipal.org/'),
('Singalila National Park', 'singalila-national-park', 6, 'Singalila National Park is a high-altitude Himalayan park in West Bengal, known for stunning views of Kanchenjunga and rare wildlife like the red panda. Spread along the Indo-Nepal border, it offers unique trekking safaris, rich birdlife, and diverse forests, making it a paradise for nature lovers and photographers.', 6000, 8000, 27.030732, 88.0591142, NULL),
('Sundarbans Tiger Reserve', 'sundarbans-tiger-reserve', 4, 'Located in West Bengal, Sundarban Tiger Reserve is part of the largest mangrove forest in the world and a UNESCO World Heritage site. Known for its unique ecosystem, it is home to the elusive Royal Bengal Tiger, saltwater crocodiles, and various bird species. Boat safaris offer a distinctive way to explore the waterways and observe the rich biodiversity in this dense and mystic mangrove landscape.', 3000, 5000, 22.135241, 88.82047, 'https://sundarbantigerreserve.org/'),
('Tadoba-Andhari Tiger Reserve', 'tadoba-andhari-tiger-reserve', 3, 'Tadoba Andhari Tiger Reserve, Maharashtra\'s oldest and largest national park, spans 1,727 square kilometers. Established in 1995, it\'s known for its high Bengal tiger density and diverse wildlife, including leopards, sloth bears, and deer species. The reserve\'s landscape features dense forests, bamboo thickets, and scenic lakes, offering excellent wildlife viewing through jeep safaris, making it a prime destination for nature enthusiasts.', 5000, 7000, 20.271717, 79.387742, 'https://mytadoba.mahaforest.gov.in/wildlife-safaris'),
('Udanti-Sitanadi Tiger Reserve', 'udanti-sitanadi-tiger-reserve', 2, 'Udanti-Sitanadi Tiger Reserve, located in Chhattisgarh, India, spans approximately 1,325 square kilometers. Established in 2007, it encompasses a mix of forests, grasslands, and riverine areas. The reserve is known for its conservation efforts for the Bengal tiger and the Indian wild dog (dhole). It also supports diverse wildlife, including leopards, sambar deer, and various bird species, contributing significantly to the region\'s biodiversity.', 500, 1000, 20.123653, 82.3764148, 'https://udantisitanaditigerreserve.in/'),
('Valmiki Tiger Reserve', 'valmiki-tiger-reserve', 4, 'Valmiki Tiger Reserve, located in Bihar, India, is renowned for its rich biodiversity and pristine wilderness. It spans diverse habitats including tropical moist deciduous forests, grasslands, and riverine ecosystems. The reserve is home to Bengal tigers, Indian elephants, leopards, and various species of deer and primates.', 2000, 3000, 27.433238, 83.921641, 'https://valmikitigerreserve.com/?page_id=2397')
;

CREATE TABLE shared_safari (
    id                      INT UNSIGNED       NOT NULL AUTO_INCREMENT,
    user_id                 INT UNSIGNED       NOT NULL,
    master_park_id          INT UNSIGNED       NOT NULL,
    slug                    VARCHAR(300)       NOT NULL,
    title                   VARCHAR(255)       NOT NULL,
    theme                   TINYINT            NOT NULL,
    start_date              DATE               NOT NULL,
    end_date                DATE               NOT NULL,
    safari_count            TINYINT UNSIGNED   NOT NULL,
    total_seats             TINYINT UNSIGNED   NOT NULL,
    shared_seats            TINYINT UNSIGNED   NOT NULL,
    price_per_person_min    INT UNSIGNED       NOT NULL,
    price_per_person_max    INT UNSIGNED       NOT NULL,
    stay_category           TINYINT            NULL,
    cover_image             VARCHAR(255)       NULL,
    safari_plan             TEXT               NOT NULL,
    is_pinned               TINYINT(1)         NOT NULL DEFAULT 0,
    delete_reason           TINYINT            NULL,
    delete_details          VARCHAR(1000)      NULL,
    status                  TINYINT            NOT NULL DEFAULT 1,
    created_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              INT UNSIGNED       NULL,
    updated_by              INT UNSIGNED       NULL,
    deleted_at              DATETIME           NULL,
    deleted_by              INT UNSIGNED       NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_shared_safari_slug (slug),
    KEY idx_shared_safari_status_start_date (status, start_date),
    KEY idx_shared_safari_status_end_date (status, end_date),
    KEY idx_shared_safari_user_id_status (user_id, status),
    KEY idx_shared_safari_master_park_id_start_date (master_park_id, start_date),
    KEY idx_shared_safari_is_pinned_created_at (is_pinned, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shared_safari_member (
    id                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    shared_safari_id    INT UNSIGNED  NOT NULL,
    user_id             INT UNSIGNED  NOT NULL,
    first_joined_at     DATETIME      NOT NULL,
    joined_at           DATETIME      NOT NULL,
    left_at             DATETIME      NULL,
    status              TINYINT       NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT UNSIGNED  NULL,
    updated_by          INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_shared_safari_member_shared_safari_id_user_id (shared_safari_id, user_id),
    KEY idx_shared_safari_member_shared_safari_id_status_joined_at (shared_safari_id, status, joined_at),
    KEY idx_shared_safari_member_user_id_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shared_safari_comment (
    id                          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    shared_safari_id            INT UNSIGNED  NOT NULL,
    shared_safari_comment_id    INT UNSIGNED  NULL,
    user_id                     INT UNSIGNED  NOT NULL,
    comment_text                TEXT          NOT NULL,
    status                      TINYINT       NOT NULL DEFAULT 1,
    created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by                  INT UNSIGNED  NULL,
    updated_by                  INT UNSIGNED  NULL,
    deleted_at                  DATETIME      NULL,
    deleted_by                  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    KEY idx_shared_safari_comment_shared_safari_id_status_created_at (shared_safari_id, status, created_at),
    KEY idx_shared_safari_comment_shared_safari_comment_id (shared_safari_comment_id),
    KEY idx_shared_safari_comment_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shared_safari_comment_flag (
    id                          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    shared_safari_comment_id    INT UNSIGNED  NOT NULL,
    user_id                     INT UNSIGNED  NOT NULL,
    master_flag_reason_id       INT UNSIGNED  NOT NULL,
    reason_name                 VARCHAR(150)  NOT NULL,
    details                     VARCHAR(1000) NOT NULL,
    status                      TINYINT       NOT NULL DEFAULT 1,
    created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by                  INT UNSIGNED  NULL,
    updated_by                  INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    KEY idx_shared_safari_comment_flag_shared_safari_comment_id_status (shared_safari_comment_id, status),
    KEY idx_shared_safari_comment_flag_status_created_at (status, created_at),
    KEY idx_shared_safari_comment_flag_master_flag_reason_id (master_flag_reason_id),
    KEY idx_shared_safari_comment_flag_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE master_flag_reason (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name            VARCHAR(150)  NOT NULL,
    status          TINYINT       NOT NULL DEFAULT 1,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      INT UNSIGNED  NULL,
    updated_by      INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_master_flag_reason_name (name),
    KEY idx_master_flag_reason_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_flag_reason (name, status) VALUES
    ('Abusive or Illegal', 1),
    ('Commercial or Spam', 1),
    ('Dating / Sexually Explicit', 1),
    ('Felt Unsafe', 1),
    ('Shows My Private Information', 1),
    ('Violates Guidelines', 1),
    ('Off Topic', 1),
    ('Other', 1);

INSERT INTO notification_template (notification_kind, client_app, code, name, title_template, sent_when, opens, status)
VALUES
    (801, 2, 'shared_safari_joined', 'Shared Safari Joined', '{{actor}} joined your safari {{subject}}.',
        'Someone joins the host''s safari for the first time', 'Shared Safari view', 1),
    (802, 2, 'shared_safari_commented', 'Shared Safari Commented', '{{actor}} commented on your safari {{subject}}.',
        'Someone comments or replies on the host''s safari', 'Shared Safari view', 1);
