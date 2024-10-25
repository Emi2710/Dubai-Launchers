export const navItems = [
  { name: "Nous", link: "#about" },
  { name: "Projets", link: "#projects" },
  { name: "Témoignages", link: "#testimonials" },
  { name: "Contact", link: "#contact" },
];

export const gridItems = [
  {
    id: 1,
    title:
      "Des solutions créatives qui respectent les normes de notre religion ",
    description: "",
    className: "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh]",
    imgClassName: "w-full h-full",
    titleClassName: "justify-end",
    img: "/b1.svg",
    spareImg: "",
  },
  {
    id: 2,
    title: "Une approche individuelle et personnalisée",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "Compétences",
    description: "Nous améliorons toujours nos",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-center",
    img: "",
    spareImg: "",
  },
  {
    id: 4,
    title: "Une équipe dynamique et enthousiate, à votre écoute",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },

  {
    id: 5,
    title: "Nous nous adaptons à votre budget et à vos besoins 🤝",
    description: "Relation humaine",
    className: "md:col-span-3 md:row-span-2",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    spareImg: "/grid.svg",
  },
  {
    id: 6,
    title: "Discutons ensemble de ce que vous souhaitez",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-center md:max-w-full max-w-60 text-center",
    img: "",
    spareImg: "",
  },
];

export const projects = [
  {
    id: 1,
    title: "Plateforme de Muslima Skills",
    des: "Plateforme dédiée à l'emploi de la femme musulmane",
    img: "/p1.png",

    link: "https://muslimaskills.com",
  },
  {
    id: 2,
    title: "Site de Dourous Abu Imran",
    des: "Enseignement de la langue arabe et des sciences religieuses",
    img: "/p2.png",

    link: "https://dourous-abuimran.com",
  },
  {
    id: 3,
    title: "Branding de Brill Auto",
    des: "Identité graphique l'entreprise de nettoyage automobile Brill Auto",
    img: "/p3.png",

    link: "https://www.behance.net/gallery/172824687/BrillAuto-car-detail-company-logo-and-UI-design",
  },
  {
    id: 3,
    title: "Identité graphique de Neqaxo",
    des: "Identité graphique et gestion des réseaux sociaux de Neqaxo",
    img: "/p4.jpg",

    link: "https://www.instagram.com/neqaxo.lar/",
  },
];

export const testimonials = [
  {
    quote:
      "Tout ce que l'on attend d'une collaboration !Umm Khadijah et Diya ont été au top tout au long du processus de création de site. N'y connaissant pas grand chose et manquant cruellement de temps, elles ont tout pris en main du design jusqu'à la mise en place de toutes les fonctionnalités du site. Elles ont pris des initiatives intelligentes concernant les options du site et sont toujours revenu vers nous pour valider les décisions importantes. Le résultat est a la hauteur 👌🏻✨",
    name: "Lina Pratlong",
    img: "/t1.jpg",
    title: "Site de Dourous Abu Imran",
  },
  {
    quote:
      "J’ai confié à umm Khadijah un projet très complexe. Je me doutais qu’il faudrait une développeuse web très expérimentée pour mon site. Au début, j’avais quelques craintes, mais lorsque j’ai vu pour la première fois le site qu’elle a codé, j’étais É-P-A-T-É 🔥🔥 ! C’était beaucoup d’émotion et de fierté 🥹 Bravo et merci encore pour ce travail professionnel ✨",
    name: "Rayhan Khassieva",
    img: "/t3.svg",
    title: "Site de Muslima Skills",
  },
  {
    quote:
      "En très peu de temps, un site a été créé pour notre école. Des corrections rapides, une approche professionnelle et un travail de qualité ont été effectués. Tous les détails ont été discutés et résolus instantanément. Ce site est maintenant bénéfique pour de nombreuses personnes, merci beaucoup ! Je ferai appel de nouveau.",
    name: "Hava M.",
    img: "/t3.png",
    title: "Site de Darul Huffaz",
  },
];

export const companies = [
  {
    id: 1,
    name: "cloudinary",
    img: "/cloud.svg",
    nameImg: "/cloudName.svg",
  },
  {
    id: 2,
    name: "appwrite",
    img: "/app.svg",
    nameImg: "/appName.svg",
  },
  {
    id: 3,
    name: "HOSTINGER",
    img: "/host.svg",
    nameImg: "/hostName.svg",
  },
  {
    id: 4,
    name: "stream",
    img: "/s.svg",
    nameImg: "/streamName.svg",
  },
  {
    id: 5,
    name: "docker.",
    img: "/dock.svg",
    nameImg: "/dockerName.svg",
  },
];

export const workExperience = [
  {
    id: 1,
    title: "Frontend Engineer Intern",
    desc: "Assisted in the development of a web-based platform using React.js, enhancing interactivity.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Mobile App Dev - JSM Tech",
    desc: "Designed and developed mobile app for both iOS & Android platforms using React Native.",
    className: "md:col-span-2", // change to md:col-span-2
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "Freelance App Dev Project",
    desc: "Led the dev of a mobile app for a client, from initial concept to deployment on app stores.",
    className: "md:col-span-2", // change to md:col-span-2
    thumbnail: "/exp3.svg",
  },
  {
    id: 4,
    title: "Lead Frontend Developer",
    desc: "Developed and maintained user-facing features using modern frontend technologies.",
    className: "md:col-span-2",
    thumbnail: "/exp4.svg",
  },
];

export const socialMedia = [
  {
    id: 1,
    img: "/git.svg",
  },
  {
    id: 2,
    img: "/twit.svg",
  },
  {
    id: 3,
    img: "/link.svg",
  },
];
