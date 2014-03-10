using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Windows;
using System.Windows.Media;
using System.Windows.Navigation;
using Windows.ApplicationModel.DataTransfer;
using Windows.System;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using Microsoft.Phone.Tasks;

namespace DebaserJS
{
    public partial class MainPage : PhoneApplicationPage
    {
        // Url of Home page
        private string MainUri = "http://debaser.azurewebsites.net/Html/index.html#/";
        private string _currentPage;
        private string _currentItemsHomePage;
        private string _currentItemsTicketPage;

        // Constructor
        public MainPage()
        {
            InitializeComponent();
            App.RootFrame.BackKeyPress += RootFrameOnBackKeyPress;
        }

        private void RootFrameOnBackKeyPress(object sender, CancelEventArgs cancelEventArgs)
        {
            if (Browser.CanGoBack)
            {
                Browser.GoBack();
                cancelEventArgs.Cancel = true;
            }
            else
                cancelEventArgs.Cancel = false;
        }

        private void Browser_Loaded(object sender, RoutedEventArgs e)
        {
            Browser.LoadCompleted += BrowserOnLoadCompleted;
            Browser.ScriptNotify += Navigation_Listener;

            // Add your URL here
            Browser.Navigate(new Uri(MainUri, UriKind.Absolute));
        }

        private void BrowserOnLoadCompleted(object sender, NavigationEventArgs navigationEventArgs)
        {
            Browser.LoadCompleted -= BrowserOnLoadCompleted;
            Browser.InvokeScript("setBackground", GetBackground());
            Browser.InvokeScript("setColor", GetAccentColor());
            Browser.Opacity = 100;
        }

        // Handle navigation failures.
        private void Browser_NavigationFailed(object sender, System.Windows.Navigation.NavigationFailedEventArgs e)
        {
            MessageBox.Show("Check your internet connection!");
        }

        private void AboutAppBarClick(object sender, EventArgs e)
        {
            var version = "";
            var author = "";
            try
            {
                var m =
                    (from manifest in System.Xml.Linq.XElement.Load("WMAppManifest.xml").Descendants("App")
                     select manifest).SingleOrDefault();
                if (m != null)
                {
                    var xAttributeV = m.Attribute("Version");
                    if (xAttributeV != null)
                    {
                        version = xAttributeV.Value;
                    }
                    var xAttributeA = m.Attribute("Author");
                    if (xAttributeA != null)
                    {
                        author = xAttributeA.Value;
                    }
                    Browser.InvokeScript("navToAboutView", version, author);
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
            }
        }

        void shareBtn_Click(object sender, EventArgs e)
        {
            ShareLink();
        }

        void ticketPageBtn_Click(object sender, EventArgs e)
        {
            Launcher.LaunchUriAsync(new Uri(_currentItemsTicketPage, UriKind.Absolute));
        }

        void homePageBtn_Click(object sender, EventArgs e)
        {
            Launcher.LaunchUriAsync(new Uri(_currentItemsHomePage, UriKind.Absolute));
        }

        void Navigation_Listener(object sender, NotifyEventArgs args)
        {
            var str = args.Value.Split(',');
            _currentPage = str[0];
            _currentItemsHomePage = str[1];
            _currentItemsTicketPage = str[2];

            switch (_currentPage)
            {
                case "main":
                    CreateDefaultAppbar();
                    break;
                case "detail":
                    CreateDetailAppbar();
                    break;
                case "about":
                    ClearAppbar();
                    break;

            }
        }

        private void ShareLink()
        {
            var shareLinkTask = new ShareLinkTask()
            {
                Title = "Code Samples",
                LinkUri = new Uri(_currentItemsHomePage, UriKind.Absolute),
                Message = "Here are some great code samples for Windows Phone."
            };

            shareLinkTask.Show();
        }

        private void CreateDefaultAppbar()
        {
            ClearAppbar();
            ApplicationBar = new ApplicationBar
            {
                Mode = ApplicationBarMode.Minimized,
                IsMenuEnabled = true
            };
            var aboutBtn = new ApplicationBarMenuItem { Text = "om" };
            aboutBtn.Click += AboutAppBarClick;
            ApplicationBar.MenuItems.Add(aboutBtn);

        }

        private void CreateDetailAppbar()
        {
            ClearAppbar();
            ApplicationBar = new ApplicationBar
            {
                Mode = ApplicationBarMode.Default,
                IsMenuEnabled = true
            };

            var homePageBtn = new ApplicationBarIconButton { IconUri = new Uri("Assets/AppBar/browser.png", UriKind.Relative), Text = "hemsida" };
            homePageBtn.Click += homePageBtn_Click;
            ApplicationBar.Buttons.Add(homePageBtn);

            if (!String.IsNullOrWhiteSpace(_currentItemsTicketPage))
            {
                var ticketPageBtn = new ApplicationBarIconButton { IconUri = new Uri("Assets/AppBar/ticket.png", UriKind.Relative), Text = "biljett" };
                ticketPageBtn.Click += ticketPageBtn_Click;
                ApplicationBar.Buttons.Add(ticketPageBtn);
            }

            var shareBtn = new ApplicationBarIconButton { IconUri = new Uri("Assets/AppBar/node.png", UriKind.Relative), Text = "dela" };
            shareBtn.Click += shareBtn_Click;
            ApplicationBar.Buttons.Add(shareBtn);

            var aboutBtn = new ApplicationBarMenuItem { Text = "om" };
            aboutBtn.Click += AboutAppBarClick;
            ApplicationBar.MenuItems.Add(aboutBtn);
        }

        private void ClearAppbar()
        {
            if (ApplicationBar != null)
            {
                ApplicationBar.Buttons.Clear();
                ApplicationBar.MenuItems.Clear();
                ApplicationBar = null;
            }
        }

        public string GetBackground()
        {
            var color = (SolidColorBrush)Application.Current.Resources["PhoneForegroundBrush"];
            var s = color.Color.ToString();
            return s == "#FFFFFFFF" ? "black" : "white";
        }

        public string GetAccentColor()
        {
            var c = (Color)Application.Current.Resources["PhoneAccentColor"];
            return "#" + c.R.ToString("X2") + c.G.ToString("X2") + c.B.ToString("X2");
        }
    }
}
