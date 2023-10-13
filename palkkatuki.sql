-- phpMyAdmin SQL Dump
-- version 5.3.0-dev+20221010.6785c97d22
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 13, 2023 at 05:25 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `palkkatuki`
--

-- --------------------------------------------------------

--
-- Table structure for table `painike`
--

CREATE TABLE `painike` (
  `id` int(11) NOT NULL,
  `sisalto_id` int(11) NOT NULL,
  `nimi` varchar(255) NOT NULL,
  `destination_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `painike`
--

INSERT INTO `painike` (`id`, `sisalto_id`, `nimi`, `destination_id`) VALUES
(75, 294, 'Voinko hakea palkkatukea?', 295),
(76, 294, 'Miten toimia?', 296),
(77, 296, 'Palkkatukihakemus', 297),
(78, 296, 'Muuta tietoa', 298),
(79, 297, 'Muuta tietoa', 298),
(80, 295, 'Miten toimia?', 296),
(81, 295, 'Palkkatukihakemus', 297),
(85, 300, 'Edellytykset', 295),
(86, 300, 'Miten toimia?', 296),
(87, 301, 'Edellytykset', 295),
(88, 301, 'Miten toimia?', 296);

-- --------------------------------------------------------

--
-- Table structure for table `runko`
--

CREATE TABLE `runko` (
  `id` int(11) NOT NULL,
  `nimike` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `runko`
--

INSERT INTO `runko` (`id`, `nimike`) VALUES
(279, 'Palkkatukiopas');

-- --------------------------------------------------------

--
-- Table structure for table `sisalto`
--

CREATE TABLE `sisalto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `runko_id` int(11) DEFAULT NULL,
  `otsikko` varchar(250) NOT NULL,
  `kentta` longtext DEFAULT NULL,
  `jarjestysNro` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sisalto`
--

INSERT INTO `sisalto` (`id`, `runko_id`, `otsikko`, `kentta`, `jarjestysNro`) VALUES
(294, 279, 'Mitä on palkkatuki?', '<p><strong class=\"ql-size-large\">Palkkatuki</strong><span class=\"ql-size-large\"> on harkinnanvarainen taloudellinen tuki, jota TE-toimisto tai kuntakokeilu voi myöntää organisaatiollesi työttömän työnhakijan palkkauskustannuksiin.</span></p><p><br></p><p><span class=\"ql-size-large\">Uudistettua palkkatukea koskevan lainsäädännön tavoitteena on yksinkertaistaa järjestelmää ja lisätä tuen käyttöä yrityksissä.</span></p><p><br></p><p><span class=\"ql-size-large\">Palkkatuen käytön lisäämisellä yrityksissä pyritään lisäämään palkkatuen vaikuttavuutta ja nostamaan tätä kautta työllisyysastetta.</span></p><p><br></p><p><span class=\"ql-size-large\">﻿</span></p>', 2),
(295, 279, 'Edellytykset', '<p><span class=\"ql-size-large\">Palkkatukea voivat saada kaikki työnantajat (lukuun ottamatta valtion virastoja ja laitoksia).</span></p><p><span class=\"ql-size-large\">Työsuhde ei saa alkaa ennen kuin tuen myöntämisestä on tehty päätös.</span></p><p><br></p><p><span class=\"ql-size-large\">Palkkatuen myöntäminen edellyttää, että</span></p><p><br></p><p><span class=\"ql-size-large\">palkkatuki ei vääristä kilpailua</span></p><p><span class=\"ql-size-large\">työnantaja sitoutuu maksamaan työehtosopimuksen mukaisen palkan</span></p><p><span class=\"ql-size-large\">työnantaja on hoitanut lakisääteiset velvoitteensa</span></p><p><br></p><p><span class=\"ql-size-large\">﻿</span></p>', 3),
(296, 279, 'Miten toimia?', '<p><span class=\"ql-size-large\">Hae palkkatukea hyvissä ajoin ennen työsuhteen alkamista </span><a href=\"https://asiointi.mol.fi/omaasiointi/?kieli=fi\" rel=\"noopener noreferrer\" target=\"_blank\" class=\"ql-size-large\">Oma asiointi</a><span class=\"ql-size-large\"> -verkkopalvelussa.</span></p><p><br></p><p><span class=\"ql-size-large\">TE-toimista tai kuntakokeilu tarkistaa palkkatuen myöntämisehdot ja verotukseen liittyvät tiedot sekä pyytää tarvittaessa lisätietoja ennen päätöstä. Työsuhde voi alkaa vasta, kun palkkatuki on myönnetty.</span></p><p><br></p><p><span class=\"ql-size-large\">Jos haet jatkoa palkkatuelle, jätä jatkohakemus ennen tukijakson päättymistä. Työsuhteen täytyy jatkua välittömästi siitä, kun edellinen tukijakso päättyy.</span></p><p><br></p><p><span class=\"ql-size-large\">﻿</span></p>', 4),
(297, 279, 'Palkkatukihakemus', '<p><span class=\"ql-size-large\">Palkkatuki lomakkeessa kysytään aisoita, joiden avulla nähdään voitko saada palkkatukea.</span></p><p><br></p><p><a href=\"https://sa01elysuomifilomakkeet.blob.core.windows.net/blobsuomifilomakkeet/ELY/tem320_fi_palkkatukihakemus.pdf\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"data:image/png;base64,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\"></a></p><p><br></p>', 5),
(298, 279, 'Muuta tietoa', '<p><span class=\"ql-size-large\">Tarvitsetko vielä lisätietoa aiheeseen liittyen?</span></p><p><span class=\"ql-size-large\">Katso näitä:</span></p><p><br></p><p><br></p><p><br></p><p><br></p><ul><li><a href=\"samplelink\" rel=\"noopener noreferrer\" target=\"_blank\" class=\"ql-size-large\">samplelink</a></li><li><a href=\"samplelink2\" rel=\"noopener noreferrer\" target=\"_blank\" class=\"ql-size-large\">samplelink2</a></li><li><a href=\"samplelink3\" rel=\"noopener noreferrer\" target=\"_blank\" class=\"ql-size-large\">samplelink3</a></li><li><a href=\"Link\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"data:image/png;base64,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\"></a> <a href=\"link\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"data:image/png;base64,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\"></a> <a href=\"google.com\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAdCAYAAADCdc79AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAluSURBVFhHPZfZjxxXFcZPd1X13j09m8eOHeOF2PISxAOKjaJERDwg+QHxwkMQ4oG/xP9R4AUJ5SWAjYlJAngDCyNlvMju6WV6X6q7qvl9p9qp0Z3qunWX737nO0vl/vn1/bXZ2nK0NDVbJYnpytNy6l3T6Rdj+J2kK1stl7ZcLGyxmNuS36sVfTTL5RiXs3wQWhSGls/nLedt08/7fBAwLGeB382CfOB9Ppbn3Nf37jggdjPtzS8LWUy/BGYNynUKSIDGgJhOJzafzqzb6Vi73bbhcACwBePNokLBqrWaVesNq1ZrVuA5ZX6c6BArX7daqVihVLJiseig1aeWD/LcI8vd/eJz9kxBaAwqeed6DZgEIA4osWQV22IyteFgYJ1O216/emW9XtcmkwnvYU4nZ4EwCq3ebNrO3r41d/asXCrrWLaIY4s3rQyYar1m5XLZoiiyECBBuGEtH1rui8//sBbaUqngnQKnTTJmUluxyGwyssFxHxA9WttSTitWQkwjUyVqjF3CBPax2taWXbjwnu2dOGEBIHVArTtnToyZJZCI/mIRQBuGMhNitgdoSCykaxbzidnkFBMJzGIytvFwaMPRyDWTsimwLUE7KSyqrVYJLCxcf4PR2AbDkb1z5oz9+KOPrQgjOqi0pEvgY+YmAg+0EHZklQCm8ugp94/7dzlAZh5kJEzYO7b5bGZTmFmgl8V8noFNYsAmlhNoDpCsZFqAs4nEveTdcDR1QJPp1H5265Zt7exkG+UC1xQkOEMuC20mvdOjy8d98+WfsYxe0uN6SaB2btPxyOZoJF0tNd0CVlqnOlnCHZEzIVnBEAcRSzGHEEPzxdKO+yProrEiOvnRjQ9sZ2eXeWsrII1ypYzWSjCCXmAg0UFZg83dZPnEacdktGW8tOlsYiNM1O/3bTwe+8YRkyW+CDurhdDvLsyCgRqnfvs+pBURa4H2/NtD+/1nv7MXh4e2mOEUrDnoyytnMLrwEALFLgEPDJAS/PY3v7otMNLEHNOMoHuAN03QTsCmEntAHMmJFbSlJsZc9E4rF3c3gQ7KHDnFfAbLMDxkvcdPHlujUWetos3oX6I3DYYbH/t2LcW94Nef/vK2mJHXiBExI4+ac6JGtWqlYoFDrJhEk7lkos0Cbz1SgNLNs37LrNPJzEFJS2OA/e/ZMzdJhTikg8/Q6GqJZZgjoTsw5ga/+Pmt25owY6LijNgRS2KiTrwoRIEDcq/QqTYba1P5jUQuEK5LeNf7JTrs9fqwM7SHjx77K3lTm2AqMAoPsoprFeAxustpXfqCTz7+8LYmanG5qAKc0oKYUFSN0IY7AvSmbCQgGTOZ7oTEPc/HCPMaHS5chwoTz1+8JAiWEPaOv5/CjHQrS7RaLcTfsxfPX1ifu3QXfPThjdvfv3jR9vZ2HZTSg9xcOiljcwFKE7xrQ6uYy2IRF6cSMIlRl+4KkFpjSQzT4Q4ODuwEAVKRWR4Wx5iTUKKorng0GPatUq7YtWtXkUdRqeOPay2uRUaDofXa5KijIxdes0FeKkXfCTlgA3d/YpCs5CYDqC6BlY6WPE+nc49FMh3+bUvGTuUwpJ9Op2ed3rHVWbu+1bC9/X278QGhobntDOWjKEsZb/ORjq6cozw1IjpPxtwBOqbNWFABUMAERnbPix1MkKUZUgMbLzCLdKfqIM8YsSwhKV55imD+MY7TJwRcu3rNmgJD0PSsL/vrtELiwPhTeSGX7XWPEfkQcETfwYjnnvWPj9lUbgsjMKCmFBPLa/BWgQuJuBVM1Niqk8sCz2ErAqxQqRSRaZbkw5TA2mw0GR/CrsIFrMsVNdDFKmRMEENv3ry2w8NvrXXUsVdvWvbo309JC5MNYyOL0cHS3RfWAFKA6RpaqAKkWIg8SAqoVi+SPMWmmsyi9wWa0pPAvzW1GlbalA64pYjSb3nYEGZE6xE1Txtmvnn0xO7d/wqtkXDnM1gbeW2kVFPmxBjCvS5ifgVwpSCyMq3E6YscuihzaH2sIDBF4lscEwJgzush9hcw3iMa6YfJKkMKhSJ31TECGnoto/693T07e/aslxMpU2awM1X2RzvyKKWTBgyFitaYSC3F/RNYXSMBARUzYkR7KrurHpKmVA95wSYdZdpRZ0hoL1utVsdN922ruWUnT50iODZ84A/fv27vUlKoIgx51mJZASbg5DhYGHS61sdLh3hR+3XLXh4+t/l4asksNvxHO7k8BKhWrdtPPvmpoWBb8yyWIuojAInITNABdUmZ0vPU6dN2kdjU3NkGAOmDgKmorUovIsitARBgFlUJEre26raOPBiKOWX2MZE/ITWEoZ/a++ShbO9x5+bNm3bu3DnfWyxrf8km70EIHQmlF+eYrFbfsitXrtrO9g6M1dwdZSrVOyrAVl52MB5m8zBz3O7aUauNBw7Bh5ditsbWtu3unyBNrC2mQ6aXaHWICxcveMBsEIekJwVaebtrCDguZG/YNcAUJVLG3sFJO3v+e7a9u+vRt3XU9jCv+CQWtLhqmQU66XcQ/1HXvVCxMOaf6qIZIBaIdq5gSb0ENnvv0mW7dOmK7Z84IDjWSbYlEMjLKApZN/f3v+mrw5mn8U8RlwViahYVaT0SYgdzPHzwL9gg4VYpzmEsgtV6uWr5OcCoElVfEx4Bg/sSi3TXcwrzSN9GBM0z587blR+8b02Yly4Vk5S0lZZU3KniANDdDSC/ZbqAkYSTKX2MyDVTYo+i9JOHD+y423ZABUxYQnOVPDHHS1mZBa9i4RXz5WwBrr1CEkMOd/DuWbty/Tol7TZOQTrSXlAm/SgezQklKn9yX32pmtrfOyivS/TbkVMnMVAxSf1yVdEq1oZE7PExkRv9pAAp6AsE0QqQSkh5omsT77l4+bKdOX/BpZDDIVg9+zCAEVUWqo3G46GNMkB3wCFlZ5ejc5IgXKfF9srOSiWqfT0X6U/goXrGIu2jlr1++dI6BFGlFtGvj8CTp9+xy9fIVXynhXzzaemsflLsWrke5/Mp60+tzwfnf54+BdC9vzBMgORpG0AbYAKVYo6E+nfCxpqoxBhhKjkAvkppm9VJCo4qWzSm2+3as/8+w4u2rFyvu0tLL1kW0McB33WMHQBihE71idXyCoOEfP/un/D4TdASxQ4nu1RISXRrNlR5oqpSJvMgpqgKW0oFOsOKTZTxxYA+m5V27tz9q28kk0gjmqN30qbypYuZOSXyn2JdpVKx/wPX3tW5l3nxFwAAAABJRU5ErkJggg==\"></a></li></ul>', 6),
(301, 279, 'Yleisesti', '<p><strong class=\"ql-size-large\">Palkkatukiopas </strong><span class=\"ql-size-large\">on luotu yritysten sekä työntekijöiden käyttöön. Oppaan tarkoituksena on antaa käsitys palkkatukihakemuksen vaatimuksista ja hakuprosessista.</span></p><p><br></p><p><span class=\"ql-size-small\">Small</span></p><p>Normal</p><p><span class=\"ql-size-large\">Large</span></p><p><span class=\"ql-size-huge\">Huge</span></p>', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `painike`
--
ALTER TABLE `painike`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `runko`
--
ALTER TABLE `runko`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sisalto`
--
ALTER TABLE `sisalto`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `painike`
--
ALTER TABLE `painike`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `runko`
--
ALTER TABLE `runko`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=280;

--
-- AUTO_INCREMENT for table `sisalto`
--
ALTER TABLE `sisalto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=313;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
