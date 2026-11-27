const Footer = () => {
    return (
        <footer className="w-full text-center py-4 px-6 text-xs text-text-muted backdrop-blur-xs mt-auto">
            Data for weekly events provided by league partners and data for
            sanctioned and championship series events fetched from{' '}
            <a
                href="https://pokedata.ovh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
            >
                pokedata.ovh
            </a>
        </footer>
    );
};

export default Footer;
